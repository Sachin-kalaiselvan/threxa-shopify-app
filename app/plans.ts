// Plan identifiers — shared between client UI and server billing config.
// No server-only imports here so this can be imported from both sides.
export const PLAN_LAUNCH = "Launch" as const;
export const PLAN_GROWTH = "Growth" as const;
export const PLAN_PRO    = "Pro"    as const;
export type PlanId = typeof PLAN_LAUNCH | typeof PLAN_GROWTH | typeof PLAN_PRO;

export const PLANS = [
  { id: PLAN_LAUNCH, price: "₹8,000 / mo",  line: "1 automation, up to 1,000 orders/mo" },
  { id: PLAN_GROWTH, price: "₹16,000 / mo", line: "All automations, up to 5,000 orders/mo" },
  { id: PLAN_PRO,    price: "₹45,000 / mo", line: "Unlimited + priority founder support" },
] as const;
