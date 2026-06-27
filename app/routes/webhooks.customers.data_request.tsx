import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { exportCustomer } from "../models/customer.server";

interface DataRequestPayload {
  customer?: { id?: number };
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload } = await authenticate.webhook(request);
  const body = payload as DataRequestPayload;
  const customerId = String(body?.customer?.id ?? "");
  if (customerId) {
    const data = await exportCustomer(shop, customerId);
    // Deliver to merchant (wire to email/Partner Dashboard in production).
    console.log(
      `[data_request] ${shop} customer ${customerId}:`,
      JSON.stringify(data),
    );
  }
  return new Response();
};
