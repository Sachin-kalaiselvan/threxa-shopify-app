import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { processDueJobs } from "../services/queue.server";

// Drains the retry queue. Point a scheduler (cron-job.org, GitHub Actions,
// Render cron) at POST /cron/process-jobs with the CRON_SECRET bearer token.
function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  if (!authorized(request)) return new Response("Unauthorized", { status: 401 });
  const processed = await processDueJobs(50);
  return Response.json({ processed });
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  if (!authorized(request)) return new Response("Unauthorized", { status: 401 });
  const processed = await processDueJobs(50);
  return Response.json({ processed });
};
