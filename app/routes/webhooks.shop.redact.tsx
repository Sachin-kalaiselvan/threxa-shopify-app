import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { redactShop } from "../models/customer.server";

// GDPR: 48h after uninstall, erase everything for the shop.
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop } = await authenticate.webhook(request);
  await redactShop(shop);
  return new Response();
};
