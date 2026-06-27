import type { HandlerResult } from "./types";

// Creates a return pickup. Shiprocket is the default India courier aggregator;
// the request shape mirrors its return-order endpoint.
export async function createReturnPickup(
  _shop: string,
  payload: {
    returnId: string;
    config?: { courier?: string };
    order?: Record<string, unknown>;
  },
): Promise<HandlerResult> {
  const token = process.env.SHIPROCKET_TOKEN;
  if (!token) {
    return { skipped: true, message: "No courier credentials configured" };
  }
  const res = await fetch(
    "https://apiv2.shiprocket.in/v1/external/orders/create/return",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      // Order/address fields are mapped from the Shopify return in a fuller
      // implementation; kept minimal here.
      body: JSON.stringify({ order_id: payload.returnId }),
    },
  );
  if (!res.ok) {
    throw new Error(`Courier API responded ${res.status}`);
  }
  return { refId: payload.returnId, message: "Return pickup created" };
}
