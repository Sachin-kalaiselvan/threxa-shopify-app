import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { getConfig, saveConfig } from "../models/automation.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const saved = await getConfig<{ courier?: string; windowDays?: number }>(
    session.shop,
    "returns",
  );
  return {
    enabled: saved?.enabled ?? false,
    config: {
      courier: saved?.config.courier ?? "shiprocket",
      windowDays: saved?.config.windowDays ?? 7,
    },
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const form = await request.formData();
  await saveConfig(
    session.shop,
    "returns",
    {
      courier: String(form.get("courier") ?? "shiprocket"),
      windowDays: Number(form.get("windowDays") ?? 7),
    },
    form.get("enabled") === "true",
  );
  return { ok: true };
};

export default function ReturnsPage() {
  const { enabled, config } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const [on, setOn] = useState(enabled);
  const [courier, setCourier] = useState(config.courier);
  const [windowDays, setWindowDays] = useState(String(config.windowDays));
  const saving = fetcher.state !== "idle";

  return (
    <s-page heading="Returns management">
      <s-section heading="Returns portal">
        <s-paragraph>
          A branded self-service portal where customers raise returns and
          exchanges. Restock logic is idempotent — no duplicate restocking,
          a common failure mode in other returns apps.
        </s-paragraph>
      </s-section>

      <s-section heading="Configuration">
        <s-stack direction="block" gap="base">
          <s-switch
            label="Enable returns portal"
            checked={on}
            onChange={(event) => setOn(event.currentTarget.checked)}
          />
          <s-select
            label="Pickup courier"
            name="courier"
            value={courier}
            onChange={(event) => setCourier(String(event.currentTarget.value))}
          >
            <s-option value="shiprocket">Shiprocket</s-option>
            <s-option value="delhivery">Delhivery</s-option>
            <s-option value="bluedart">Blue Dart</s-option>
          </s-select>
          <s-number-field
            label="Return window (days)"
            name="windowDays"
            value={windowDays}
            onChange={(event) => setWindowDays(String(event.currentTarget.value))}
          />
          <s-stack direction="inline" gap="base">
            <s-button
              variant="primary"
              onClick={() =>
                fetcher.submit(
                  { enabled: String(on), courier, windowDays },
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
    </s-page>
  );
}
