import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { getConfig, saveConfig } from "../models/automation.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const saved = await getConfig<{ companyName?: string; voucherType?: string; bridgeUrl?: string }>(
    session.shop,
    "tally",
  );
  return {
    enabled: saved?.enabled ?? false,
    config: {
      companyName: saved?.config.companyName ?? "",
      voucherType: saved?.config.voucherType ?? "Sales",
      bridgeUrl: saved?.config.bridgeUrl ?? "",
    },
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const form = await request.formData();
  await saveConfig(
    session.shop,
    "tally",
    {
      companyName: String(form.get("companyName") ?? ""),
      voucherType: String(form.get("voucherType") ?? "Sales"),
      bridgeUrl: String(form.get("bridgeUrl") ?? ""),
    },
    form.get("enabled") === "true",
  );
  return { ok: true };
};

export default function TallyPage() {
  const { enabled, config } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const [on, setOn] = useState(enabled);
  const [companyName, setCompanyName] = useState(config.companyName);
  const [voucherType, setVoucherType] = useState(config.voucherType);
  const [bridgeUrl, setBridgeUrl] = useState(config.bridgeUrl);
  const saving = fetcher.state !== "idle";

  const save = () =>
    fetcher.submit(
      { enabled: String(on), companyName, voucherType, bridgeUrl },
      { method: "POST" },
    );

  return (
    <s-page heading="Tally reconciliation">
      <s-section heading="How it works">
        <s-paragraph>
          Every paid order and refund becomes a GST-ready Tally voucher, pushed
          to Tally Prime through a local bridge. Reconcile faster and file
          GSTR-3B without manual entry.
        </s-paragraph>
      </s-section>

      <s-section heading="Configuration">
        <s-stack direction="block" gap="base">
          <s-switch
            label="Enable Tally reconciliation"
            checked={on}
            onChange={(event) => setOn(event.currentTarget.checked)}
          />
          <s-text-field
            label="Tally company name"
            name="companyName"
            value={companyName}
            placeholder="Exactly as it appears in Tally Prime"
            onChange={(event) => setCompanyName(String(event.currentTarget.value))}
          />
          <s-url-field
            label="Tally bridge URL"
            name="bridgeUrl"
            value={bridgeUrl}
            details="The HTTP endpoint of the Threxa Tally bridge running on your accounts machine."
            onChange={(event) => setBridgeUrl(String(event.currentTarget.value))}
          />
          <s-select
            label="Voucher type"
            name="voucherType"
            value={voucherType}
            onChange={(event) => setVoucherType(String(event.currentTarget.value))}
          >
            <s-option value="Sales">Sales</s-option>
            <s-option value="Receipt">Receipt</s-option>
          </s-select>
          <s-stack direction="inline" gap="base">
            <s-button variant="primary" onClick={save} {...(saving ? { loading: true } : {})}>
              Save
            </s-button>
            {fetcher.data?.ok && <s-badge tone="success">Saved</s-badge>}
          </s-stack>
        </s-stack>
      </s-section>

      <s-section slot="aside" heading="Why Threxa">
        <s-unordered-list>
          <s-list-item>Priced in INR — no surprise USD usage fees</s-list-item>
          <s-list-item>Full audit log of every voucher pushed</s-list-item>
          <s-list-item>Failed pushes retry automatically and alert you</s-list-item>
        </s-unordered-list>
      </s-section>
    </s-page>
  );
}
