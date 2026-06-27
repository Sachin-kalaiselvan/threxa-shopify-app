import db from "../db.server";
import type { AutomationKey } from "./automation.server";

export type AuditStatus = "success" | "failed" | "pending" | "skipped";

export async function logAudit(input: {
  shop: string;
  automation: AutomationKey;
  event: string;
  status: AuditStatus;
  message?: string;
  refId?: string;
  source?: "webhook" | "manual" | "retry";
}) {
  return db.auditLog.create({
    data: {
      shop: input.shop,
      automation: input.automation,
      event: input.event,
      status: input.status,
      message: input.message ?? null,
      refId: input.refId ?? null,
      source: input.source ?? "webhook",
    },
  });
}

export async function recentEvents(
  shop: string,
  opts: { automation?: AutomationKey; limit?: number } = {},
) {
  return db.auditLog.findMany({
    where: { shop, ...(opts.automation ? { automation: opts.automation } : {}) },
    orderBy: { createdAt: "desc" },
    take: opts.limit ?? 50,
  });
}

export async function failuresSince(
  shop: string,
  automation: AutomationKey,
  since: Date,
) {
  return db.auditLog.count({
    where: { shop, automation, status: "failed", createdAt: { gte: since } },
  });
}
