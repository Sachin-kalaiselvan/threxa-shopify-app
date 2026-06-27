// Result returned by every job handler.
// `skipped` = nothing to do / not configured yet (no retry, logged as "skipped").
export interface HandlerResult {
  refId?: string;
  message?: string;
  skipped?: boolean;
}
