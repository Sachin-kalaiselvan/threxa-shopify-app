import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getConfig } from "../models/automation.server";
import { enqueue } from "../models/job.server";
import { upsertContact } from "../models/customer.server";
import { logAudit } from "../models/audit.server";
import { processDueJobs } from "../services/queue.server";

interface ShopifyOrder {
  id: number;
  name?: string;
  total_price?: string;
  currency?: string;
  created_at?: string;
  payment_gateway_names?: string[];
  customer?: {
    id?: number;
    email?: string;
    phone?: string;
  };
  shipping_address?: { phone?: string };
}

function isCod(order: ShopifyOrder): boolean {
  return (order.payment_gateway_names ?? []).some((n) =>
    /cod|cash on delivery/i.test(n),
  );
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload } = await authenticate.webhook(request);
  const order = payload as ShopifyOrder;

  // Tally: queue a voucher push for every order (if enabled).
  const tally = await getConfig(shop, "tally");
  if (tally?.enabled) {
    await enqueue({
      shop,
      automation: "tally",
      type: "tally.pushVoucher",
      payload: { order, config: tally.config },
    });
    await logAudit({
      shop,
      automation: "tally",
      event: "order.created",
      status: "pending",
      refId: String(order.id),
    });
  }

  // WhatsApp COD verification.
  const whatsapp = await getConfig(shop, "whatsapp");
  if (whatsapp?.enabled && isCod(order)) {
    const phone =
      order.customer?.phone ?? order.shipping_address?.phone;
    if (order.customer?.id) {
      await upsertContact(shop, String(order.customer.id), {
        phone,
        email: order.customer.email,
      });
    }
    await enqueue({
      shop,
      automation: "whatsapp",
      type: "whatsapp.verifyCod",
      payload: { phone, orderName: order.name, config: whatsapp.config },
    });
    await logAudit({
      shop,
      automation: "whatsapp",
      event: "cod.order",
      status: "pending",
      refId: String(order.id),
    });
  }

  await processDueJobs();
  return new Response();
};
