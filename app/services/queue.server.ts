import type { AutomationKey } from "../models/automation.server";
import { claimDueJobs, markDone, markFailed } from "../models/job.server";
import { logAudit } from "../models/audit.server";
import { recordRun } from "../models/health.server";
import { pushVoucher } from "./tally.server";
import { sendCodVerification } from "./whatsapp.server";
import { createReturnPickup } from "./courier.server";
import { applySync } from "./inventory.server";
import type { HandlerResult } from "./types";

type Handler = (
  shop: string,
  payload: Record<string, unknown>,
) => Promise<HandlerResult>;

const HANDLERS: Record<string, Handler> = {
  "tally.pushVoucher": pushVoucher as Handler,
  "whatsapp.verifyCod": sendCodVerification as Handler,
  "returns.createPickup": createReturnPickup as Handler,
  "inventory.sync": applySync as Handler,
};

// Claimed job shape from Prisma (mirrors Job model fields we need).
interface ClaimedJob {
  id: string;
  shop: string;
  automation: AutomationKey;
  type: string;
  payload: string;
  attempts: number;
  maxAttempts: number;
}

export async function processDueJobs(limit = 10): Promise<number> {
  const jobs = (await claimDueJobs(limit)) as ClaimedJob[];

  for (const job of jobs) {
    const handler = HANDLERS[job.type];
    const automation = job.automation;

    if (!handler) {
      await markFailed(job, `No handler for job type ${job.type}`);
      await logAudit({
        shop: job.shop,
        automation,
        event: job.type,
        status: "failed",
        message: "Unknown job type",
        source: "retry",
      });
      continue;
    }

    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(job.payload) as Record<string, unknown>;
    } catch {
      await markFailed(job, "Invalid JSON payload");
      continue;
    }

    try {
      const result = await handler(job.shop, parsed);
      await markDone(job.id);
      await logAudit({
        shop: job.shop,
        automation,
        event: job.type,
        status: result.skipped ? "skipped" : "success",
        message: result.message,
        refId: result.refId,
        source: job.attempts > 0 ? "retry" : "webhook",
      });
      if (!result.skipped) await recordRun(job.shop, automation, true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);
      await markFailed(job, message);
      await logAudit({
        shop: job.shop,
        automation,
        event: job.type,
        status: "failed",
        message,
        source: "retry",
      });
      await recordRun(job.shop, automation, false);
    }
  }

  return jobs.length;
}
