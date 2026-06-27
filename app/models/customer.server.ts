import db from "../db.server";

// Threxa stores the minimum PII needed: phone (WhatsApp) and email (returns).
export async function upsertContact(
  shop: string,
  customerId: string,
  contact: { phone?: string; email?: string },
) {
  return db.customerContact.upsert({
    where: { shop_customerId: { shop, customerId } },
    create: { shop, customerId, phone: contact.phone ?? null, email: contact.email ?? null },
    update: { phone: contact.phone ?? null, email: contact.email ?? null },
  });
}

// GDPR data export — everything Threxa holds for one customer.
export async function exportCustomer(shop: string, customerId: string) {
  const contacts = await db.customerContact.findMany({
    where: { shop, customerId },
  });
  const activity = await db.auditLog.findMany({
    where: { shop, refId: { contains: customerId } },
    orderBy: { createdAt: "desc" },
  });
  return { contacts, activity };
}

// GDPR erase for one customer.
export async function redactCustomer(shop: string, customerId: string) {
  await db.customerContact.deleteMany({ where: { shop, customerId } });
}

// GDPR erase everything for a shop (48h after uninstall).
export async function redactShop(shop: string) {
  await db.$transaction([
    db.customerContact.deleteMany({ where: { shop } }),
    db.auditLog.deleteMany({ where: { shop } }),
    db.automationHealth.deleteMany({ where: { shop } }),
    db.automationConfig.deleteMany({ where: { shop } }),
    db.job.deleteMany({ where: { shop } }),
    db.subscription.deleteMany({ where: { shop } }),
    db.session.deleteMany({ where: { shop } }),
  ]);
}
