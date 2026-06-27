import type { HandlerResult } from "./types";

// Sends a COD verification message through the OFFICIAL WhatsApp Business
// Cloud API (graph.facebook.com). Never device-linking — that is what gets
// competitor apps' numbers banned by Meta.
export async function sendCodVerification(
  _shop: string,
  payload: {
    phone?: string;
    orderName?: string;
    config?: { templateName?: string; languageCode?: string };
  },
): Promise<HandlerResult> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_ID;
  if (!token || !phoneNumberId || !payload.phone) {
    return { skipped: true, message: "WhatsApp not connected or no customer phone" };
  }
  const cfg = payload.config ?? {};
  const res = await fetch(
    `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: payload.phone,
        type: "template",
        template: {
          name: cfg.templateName || "cod_verification",
          language: { code: cfg.languageCode || "en" },
        },
      }),
    },
  );
  if (!res.ok) {
    throw new Error(`WhatsApp API responded ${res.status}`);
  }
  const data = (await res.json()) as { messages?: Array<{ id?: string }> };
  return { refId: data.messages?.[0]?.id, message: "Verification message sent" };
}
