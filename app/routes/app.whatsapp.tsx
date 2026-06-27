import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { getConfig, saveConfig } from "../models/automation.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const saved = await getConfig<{ reminderMinutes?: number; autoCancelMinutes?: number }>(
    session.shop,
    "whatsapp",
  );
  return {
    enabled: saved?.enabled ?? false,
    config: {
      reminderMinutes: saved?.config.reminderMinutes ?? 15,
      autoCancelMinutes: saved?.config.autoCancelMinutes ?? 60,
    },
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const form = await request.formData();
  await saveConfig(
    session.shop,
    "whatsapp",
    {
      reminderMinutes: Number(form.get("reminderMinutes") ?? 15),
      autoCancelMinutes: Number(form.get("autoCancelMinutes") ?? 60),
    },
    form.get("enabled") === "true",
  );
  return { ok: true };
};

export default function WhatsAppPage() {
  const { enabled, config } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const [on, setOn] = useState(enabled);
  const [reminder, setReminder] = useState(String(config.reminderMinutes));
  const [autoCancel, setAutoCancel] = useState(String(config.autoCancelMinutes));
  const saving = fetcher.state !== "idle";

  return (
    <s-page heading="WhatsApp COD verification">
      <s-section>
        <s-banner tone="info" heading="Official WhatsApp Business API only">
          <s-paragraph>
            Threxa uses an approved WhatsApp Business Solution Provider — never
            device-linking. That keeps your number safe from the Meta bans that
            get competitor apps 1-star reviews.
          </s-paragraph>
        </s-banner>
      </s-section>

      <s-section heading="Verification rules">
        <s-stack direction="block" gap="base">
          <s-switch
            label="Enable COD verification"
            checked={on}
            onChange={(event) => setOn(event.currentTarget.checked)}
          />
          <s-number-field
            label="Send reminder after (minutes)"
            name="reminderMinutes"
            value={reminder}
            onChange={(event) => setReminder(String(event.currentTarget.value))}
          />
          <s-number-field
            label="Auto-cancel unverified COD after (minutes)"
            name="autoCancelMinutes"
            value={autoCancel}
            onChange={(event) => setAutoCancel(String(event.currentTarget.value))}
          />
          <s-stack direction="inline" gap="base">
            <s-button
              variant="primary"
              onClick={() =>
                fetcher.submit(
                  { enabled: String(on), reminderMinutes: reminder, autoCancelMinutes: autoCancel },
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
