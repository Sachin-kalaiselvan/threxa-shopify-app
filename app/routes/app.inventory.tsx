import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { getConfig, saveConfig } from "../models/automation.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const saved = await getConfig<{ safetyStock?: number }>(session.shop, "inventory");
  return {
    enabled: saved?.enabled ?? false,
    config: { safetyStock: saved?.config.safetyStock ?? 2 },
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const form = await request.formData();
  await saveConfig(
    session.shop,
    "inventory",
    { safetyStock: Number(form.get("safetyStock") ?? 2) },
    form.get("enabled") === "true",
  );
  return { ok: true };
};

export default function InventoryPage() {
  const { enabled, config } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const [on, setOn] = useState(enabled);
  const [safetyStock, setSafetyStock] = useState(String(config.safetyStock));
  const saving = fetcher.state !== "idle";

  return (
    <s-page heading="Inventory sync">
      <s-section heading="Real-time sync">
        <s-paragraph>
          Stock syncs on every order, refund, cancellation and restock via
          webhooks — not hourly batches. SKUs are normalised (case + whitespace)
          before matching to avoid silent mismatches.
        </s-paragraph>
      </s-section>

      <s-section heading="Safety buffer">
        <s-stack direction="block" gap="base">
          <s-switch
            label="Enable inventory sync"
            checked={on}
            onChange={(event) => setOn(event.currentTarget.checked)}
          />
          <s-number-field
            label="Safety-stock buffer (units held back per SKU)"
            name="safetyStock"
            value={safetyStock}
            details="Reserves stock against sync delays to prevent overselling on flash sales."
            onChange={(event) => setSafetyStock(String(event.currentTarget.value))}
          />
          <s-stack direction="inline" gap="base">
            <s-button
              variant="primary"
              onClick={() =>
                fetcher.submit(
                  { enabled: String(on), safetyStock },
                  { method: "POST" },
                )
              }
              {...(saving ? { loading: true } : {})}
            >
              Save
            </s-button>
            {fetcher.data?.ok && <s-badge tone="success">Saved</s-badge>}
          </s-stack>
        </s-stack>
      </s-section>

      <s-section slot="aside" heading="Safeguards">
        <s-unordered-list>
          <s-list-item>Dry-run preview before first full sync</s-list-item>
          <s-list-item>Every change logged with its source</s-list-item>
          <s-list-item>Never zeroes stock on uninstall</s-list-item>
        </s-unordered-list>
      </s-section>
    </s-page>
  );
}
