import db from "../db.server";
import type { AutomationKey } from "./automation.server";

// Exponential backoff capped at 1 hour.
function backoffMs(attempts: number) {
  return Math.min(30_000 * 2 ** attempts, 60 * 60 * 1000);
}

export async function enqueue(input: {
  shop: string;
  automation: AutomationKey;
  type: string;
  payload: Record<string, unknown>;
  maxAttempts?: number;
  runAt?: Date;
}) {
  return db.job.create({
    data: {
      shop: input.shop,
      automation: input.automation,
      type: input.type,
      payload: JSON.stringify(input.payload),
      maxAttempts: input.maxAttempts ?? 5,
      runAt: input.runAt ?? new Date(),
    },
  });
}

export async function claimDueJobs(limit = 10) {
  const now = new Date();
  const due = await db.job.findMany({
    where: { status: "pending", runAt: { lte: now } },
    orderBy: { runAt: "asc" },
    take: limit,
  });
  // Mark as processing so a second worker doesn't pick them up.
  await Promise.all(
    due.map((j: { id: string }) =>
      db.job.update({ where: { id: j.id }, data: { status: "processing" } }),
    ),
  );
  return due as Array<{
    id: string;
    shop: string;
    automation: AutomationKey;
    type: string;
    payload: string;
    attempts: number;
    maxAttempts: number;
  }>;
}

export async function markDone(id: string) {
  return db.job.update({ where: { id }, data: { status: "done" } });
}

export async function markFailed(
  job: { id: string; attempts: number; maxAttempts: number },
  error: string,
) {
  const attempts = job.attempts + 1;
  const exhausted = attempts >= job.maxAttempts;
  return db.job.update({
    where: { id: job.id },
    data: {
      attempts,
      lastError: error.slice(0, 1000),
      status: exhausted ? "failed" : "pending",
      runAt: exhausted ? new Date() : new Date(Date.now() + backoffMs(attempts)),
    },
  });
}
