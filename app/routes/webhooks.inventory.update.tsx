import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getConfig } from "../models/automation.server";
import { enqueue } from "../models/job.server";
import { processDueJobs } from "../services/queue.server";

interface InventoryLevel {
  inventory_item_id?: number;
  location_id?: number;
  available?: number;
  updated_at?: string;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload } = await authenticate.webhook(request);
  const level = payload as InventoryLevel;

  const inventory = await getConfig(shop, "inventory");
  if (inventory?.enabled) {
    await enqueue({
      shop,
      automation: "inventory",
      type: "inventory.sync",
      payload: {
        inventoryItemId: level.inventory_item_id,
        available: level.available,
        config: inventory.config,
      },
    });
    await processDueJobs();
  }
  return new Response();
};
