import db from "../db.server";

export async function getSubscription(shop: string) {
  return db.subscription.findUnique({ where: { shop } });
}

export async function upsertSubscription(
  shop: string,
  data: { plan: string; status: string; chargeId?: string; test?: boolean },
) {
  return db.subscription.upsert({
    where: { shop },
    create: { shop, ...data },
    update: data,
  });
}
