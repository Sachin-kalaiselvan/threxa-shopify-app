import type { HandlerResult } from "./types";

// Normalise a SKU before matching across channels — case + whitespace
// differences are the most common cause of silent sync mismatches.
export function normalizeSku(sku: string): string {
  return sku.trim().toLowerCase();
}

// Applies a safety-stock buffer so flash-sale sync lag can't push a channel
// negative. Returns the quantity that should be published downstream.
export function availableWithBuffer(onHand: number, safetyStock: number): number {
  return Math.max(0, onHand - Math.max(0, safetyStock));
}

export async function applySync(
  _shop: string,
  payload: {
    inventoryItemId?: string | number;
    available?: number;
    sku?: string;
    config?: { safetyStock?: number };
  },
): Promise<HandlerResult> {
  if (payload.available == null) {
    return { skipped: true, message: "No inventory quantity in webhook" };
  }
  const safety = payload.config?.safetyStock ?? 0;
  const publish = availableWithBuffer(payload.available, safety);
  // Extension point: write `publish` to linked stores / channels here.
  return {
    refId: String(payload.inventoryItemId ?? payload.sku ?? ""),
    message: `Computed publish qty ${publish} (on-hand ${payload.available}, buffer ${safety})`,
  };
}
