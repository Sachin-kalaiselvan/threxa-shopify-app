import db from "../db.server";

export const AUTOMATIONS = ["tally", "whatsapp", "returns", "inventory"] as const;
export type AutomationKey = (typeof AUTOMATIONS)[number];

export function isAutomation(value: string): value is AutomationKey {
  return (AUTOMATIONS as readonly string[]).includes(value);
}

export interface AutomationConfig<T = Record<string, unknown>> {
  shop: string;
  automation: AutomationKey;
  enabled: boolean;
  config: T;
}

// Explicit row types so the code typechecks before prisma generate runs locally.
interface AutomationConfigRow {
  shop: string;
  automation: string;
  enabled: boolean;
  config: string;
}

interface AutomationHealthRow {
  shop: string;
  automation: string;
  status: string;
  lastRunAt: Date | null;
  failures24h: number;
}

export async function getConfig<T = Record<string, unknown>>(
  shop: string,
  automation: AutomationKey,
): Promise<AutomationConfig<T> | null> {
  const row: AutomationConfigRow | null = await db.automationConfig.findUnique({
    where: { shop_automation: { shop, automation } },
  });
  if (!row) return null;
  return {
    shop: row.shop,
    automation: row.automation as AutomationKey,
    enabled: row.enabled,
    config: JSON.parse(row.config) as T,
  };
}

export async function saveConfig(
  shop: string,
  automation: AutomationKey,
  config: Record<string, unknown>,
  enabled?: boolean,
) {
  const data = {
    config: JSON.stringify(config),
    ...(enabled === undefined ? {} : { enabled }),
  };
  return db.automationConfig.upsert({
    where: { shop_automation: { shop, automation } },
    create: { shop, automation, enabled: enabled ?? false, config: JSON.stringify(config) },
    update: data,
  });
}

export async function setEnabled(
  shop: string,
  automation: AutomationKey,
  enabled: boolean,
) {
  return db.automationConfig.upsert({
    where: { shop_automation: { shop, automation } },
    create: { shop, automation, enabled, config: "{}" },
    update: { enabled },
  });
}

// Combined config + health for the dashboard.
export async function listStatuses(shop: string) {
  const [configs, healths]: [AutomationConfigRow[], AutomationHealthRow[]] =
    await Promise.all([
      db.automationConfig.findMany({ where: { shop } }),
      db.automationHealth.findMany({ where: { shop } }),
    ]);

  const healthByKey = new Map(healths.map((h) => [h.automation, h]));
  const configByKey = new Map(configs.map((c) => [c.automation, c]));

  return AUTOMATIONS.map((automation) => {
    const cfg = configByKey.get(automation);
    const health = healthByKey.get(automation);
    const enabled = Boolean(cfg?.enabled);
    return {
      automation,
      enabled,
      state: enabled ? "active" : "needs_setup",
      health: health?.status ?? "idle",
      lastRunAt: health?.lastRunAt ?? null,
      failures24h: health?.failures24h ?? 0,
    };
  });
}
