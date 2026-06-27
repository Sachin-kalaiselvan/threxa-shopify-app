import db from "../db.server";
import type { AutomationKey } from "./automation.server";
import { failuresSince } from "./audit.server";

const DAY_MS = 24 * 60 * 60 * 1000;

// Recompute rolled-up health after each run. failures24h is derived from the
// audit log so the number is always truthful (not a drifting counter).
export async function recordRun(
  shop: string,
  automation: AutomationKey,
  success: boolean,
) {
  const now = new Date();
  const failures24h = await failuresSince(
    shop,
    automation,
    new Date(now.getTime() - DAY_MS),
  );
  const status = failures24h === 0 ? "healthy" : failures24h < 5 ? "degraded" : "down";

  return db.automationHealth.upsert({
    where: { shop_automation: { shop, automation } },
    create: {
      shop,
      automation,
      status,
      lastRunAt: now,
      lastSuccessAt: success ? now : null,
      lastFailureAt: success ? null : now,
      failures24h,
    },
    update: {
      status,
      lastRunAt: now,
      failures24h,
      ...(success ? { lastSuccessAt: now } : { lastFailureAt: now }),
    },
  });
}

export async function getAllHealth(shop: string) {
  return db.automationHealth.findMany({ where: { shop } });
}

// Whole-store health summary for the dashboard banner.
export async function storeHealth(shop: string) {
  const rows = await getAllHealth(shop);
  const failures24h = rows.reduce(
    (sum: number, r: { failures24h: number }) => sum + r.failures24h,
    0,
  );
  const down = rows.some((r: { status: string }) => r.status === "down");
  return {
    status: down ? "down" : failures24h > 0 ? "degraded" : "healthy",
    failures24h,
  };
}
