import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { redactCustomer } from "../models/customer.server";

interface RedactPayload {
  customer?: { id?: number };
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload } = await authenticate.webhook(request);
  const body = payload as RedactPayload;
  const customerId = String(body?.customer?.id ?? "");
  if (customerId) await redactCustomer(shop, customerId);
  return new Response();
};
