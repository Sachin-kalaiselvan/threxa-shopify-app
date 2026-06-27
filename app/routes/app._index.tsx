import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { listStatuses } from "../models/automation.server";
import { storeHealth } from "../models/health.server";
import { getSubscription } from "../models/subscription.server";

const META: Record<string, { title: string; href: string; description: string }> = {
  tally: {
    title: "Tally reconciliation",
    href: "/app/tally",
    description: "Push Shopify orders, refunds and credit notes into Tally Prime as GST-ready vouchers.",
  },
  whatsapp: {
    title: "WhatsApp COD",
    href: "/app/whatsapp",
    description: "Verify COD orders over the official WhatsApp Business API and auto-tag confirmed vs. cancelled.",
  },
  returns: {
    title: "Returns management",
    href: "/app/returns",
    description: "Branded returns portal with India courier pickups, exchange-first flows and store credit.",
  },
  inventory: {
    title: "Inventory sync",
    href: "/app/inventory",
    description: "Real-time, webhook-driven stock sync with a safety-stock buffer to stop overselling.",
  },
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
      query ThrexaDashboard {
        shop { name }
        ordersCount(query: "created_at:>now-30d") { count }
        productsCount { count }
      }`,
  );
  const data = (await response.json()).data;

  const [statuses, health, subscription] = await Promise.all([
    listStatuses(session.shop),
    storeHealth(session.shop),
    getSubscription(session.shop),
  ]);

  return {
    shopName: data?.shop?.name ?? session.shop,
    ordersLast30: data?.ordersCount?.count ?? 0,
    productCount: data?.productsCount?.count ?? 0,
    statuses,
    health,
    plan: subscription?.plan ?? null,
  };
};

const STATUS_BADGE: Record<string, { tone: "success" | "neutral"; label: string }> = {
  active: { tone: "success", label: "Active" },
  needs_setup: { tone: "neutral", label: "Set up" },
};

export default function Index() {
  const { shopName, ordersLast30, productCount, statuses, health, plan } =
    useLoaderData<typeof loader>();

  const activeCount = statuses.filter((s) => s.enabled).length;

  return (
    <s-page heading={`Threxa — ${shopName}`}>
      <s-button slot="primary-action" href="/app/settings">
        Settings
      </s-button>

      {!plan && (
        <s-section>
          <s-banner tone="info" heading="Choose a plan to activate automations">
            <s-paragraph>
              Flat INR pricing, no surprise usage fees.{" "}
              <s-link href="/app/settings">View plans</s-link>
            </s-paragraph>
          </s-banner>
        </s-section>
      )}

      <s-section heading="Overview">
        <s-stack direction="inline" gap="large">
          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="block" gap="small-200">
              <s-text tone="neutral">Active automations</s-text>
              <s-heading>{activeCount} / 4</s-heading>
            </s-stack>
          </s-box>
          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="block" gap="small-200">
              <s-text tone="neutral">Orders (30 days)</s-text>
              <s-heading>{ordersLast30}</s-heading>
            </s-stack>
          </s-box>
          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="block" gap="small-200">
              <s-text tone="neutral">Products tracked</s-text>
              <s-heading>{productCount}</s-heading>
            </s-stack>
          </s-box>
        </s-stack>
      </s-section>

      <s-section heading="Your automations">
        <s-grid gridTemplateColumns="1fr 1fr" gap="base">
          {statuses.map((s) => {
            const meta = META[s.automation];
            const badge = STATUS_BADGE[s.state] ?? STATUS_BADGE.needs_setup;
            return (
              <s-grid-item key={s.automation}>
                <s-box padding="base" borderWidth="base" borderRadius="base">
                  <s-stack direction="block" gap="base">
                    <s-stack direction="inline" gap="base" alignItems="center">
                      <s-heading>{meta.title}</s-heading>
                      <s-badge tone={badge.tone}>{badge.label}</s-badge>
                      {s.enabled && s.failures24h > 0 && (
                        <s-badge tone="critical">{s.failures24h} failed (24h)</s-badge>
                      )}
                    </s-stack>
                    <s-text tone="neutral">{meta.description}</s-text>
                    <s-link href={meta.href}>
                      {s.enabled ? "Manage" : "Configure"}
                    </s-link>
                  </s-stack>
                </s-box>
              </s-grid-item>
            );
          })}
        </s-grid>
      </s-section>

      <s-section slot="aside" heading="System health">
        <s-stack direction="block" gap="base">
          <s-stack direction="inline" gap="base" alignItems="center">
            <s-badge tone={health.status === "healthy" ? "success" : health.status === "degraded" ? "warning" : "critical"}>
              {health.status === "healthy" ? "Healthy" : health.status === "degraded" ? "Degraded" : "Down"}
            </s-badge>
            <s-text tone="neutral">Failures (24h): {health.failures24h}</s-text>
          </s-stack>
          <s-text tone="neutral">
            You get a WhatsApp + email alert the moment any automation fails —
            you never have to wonder if it&apos;s still running.
          </s-text>
        </s-stack>
      </s-section>

      <s-section slot="aside" heading="Support">
        <s-stack direction="block" gap="base">
          <s-text tone="neutral">Founder-led, same business day (IST).</s-text>
          <s-link href="https://wa.me/917483992418" target="_blank">WhatsApp Sachin</s-link>
          <s-link href="mailto:sachin@theingredientlist.co">sachin@theingredientlist.co</s-link>
        </s-stack>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
