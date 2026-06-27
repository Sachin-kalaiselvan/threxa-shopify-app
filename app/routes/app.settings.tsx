import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { PLANS, type PlanId } from "../plans";
import { getSubscription, upsertSubscription } from "../models/subscription.server";

interface AppSubscription { name: string }
interface BillingCheckResult {
  hasActivePayment: boolean;
  appSubscriptions: AppSubscription[];
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, billing } = await authenticate.admin(request);
  const check = (await billing.check()) as BillingCheckResult;
  const active = check.appSubscriptions?.[0];
  if (active) {
    await upsertSubscription(session.shop, { plan: active.name, status: "active" });
  }
  const sub = await getSubscription(session.shop);
  return {
    shop: session.shop,
    plan: (active?.name ?? sub?.plan ?? null) as PlanId | null,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { billing } = await authenticate.admin(request);
  const form = await request.formData();
  const plan = String(form.get("plan") ?? "") as PlanId;
  const url = new URL(request.url);
  await billing.request({
    plan,
    isTest: process.env.NODE_ENV !== "production",
    returnUrl: `${url.origin}/app/settings`,
  });
  return null;
};

export default function SettingsPage() {
  const { shop, plan } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  return (
    <s-page heading="Settings">
      <s-section heading="Plan">
        <s-stack direction="block" gap="base">
          <s-banner tone="info" heading="Transparent INR pricing">
            <s-paragraph>
              Flat monthly price in rupees — no per-message or per-order usage
              fees that appear without warning.
            </s-paragraph>
          </s-banner>
          <s-grid gridTemplateColumns="1fr 1fr 1fr" gap="base">
            {PLANS.map((p) => (
              <s-grid-item key={p.id}>
                <s-box padding="base" borderWidth="base" borderRadius="base">
                  <s-stack direction="block" gap="small-200">
                    <s-stack direction="inline" gap="base" alignItems="center">
                      <s-heading>{p.id}</s-heading>
                      {plan === p.id && <s-badge tone="success">Current</s-badge>}
                    </s-stack>
                    <s-text>{p.price}</s-text>
                    <s-text tone="neutral">{p.line}</s-text>
                    {plan !== p.id && (
                      <s-button
                        onClick={() =>
                          fetcher.submit({ plan: p.id }, { method: "POST" })
                        }
                      >
                        Choose {p.id}
                      </s-button>
                    )}
                  </s-stack>
                </s-box>
              </s-grid-item>
            ))}
          </s-grid>
        </s-stack>
      </s-section>

      <s-section heading="Store">
        <s-paragraph>Connected store: {shop}</s-paragraph>
      </s-section>

      <s-section slot="aside" heading="Support">
        <s-stack direction="block" gap="base">
          <s-text tone="neutral">Same-day replies (IST), founder-led.</s-text>
          <s-link href="https://wa.me/917483992418" target="_blank">
            WhatsApp Sachin
          </s-link>
          <s-link href="mailto:sachin@theingredientlist.co">
            sachin@theingredientlist.co
          </s-link>
        </s-stack>
      </s-section>
    </s-page>
  );
}
