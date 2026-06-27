# Threxa — Shopify App

D2C automation for Indian Shopify brands.  
Four modules: **Tally reconciliation · WhatsApp COD · Returns management · Inventory sync**

---

## Quick start

```bash
npm install
shopify auth login          # select your org + dev store
cp .env.example .env        # fill in SHOPIFY_API_KEY + SHOPIFY_API_SECRET
npm run setup               # prisma generate + migrate
npm run dev                 # shopify app dev → installs on dev store + opens browser
```

`shopify app dev` auto-fills `client_id`, `application_url`, and `redirect_urls` in `shopify.app.toml`.

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `SHOPIFY_API_KEY` | ✅ | From Partner Dashboard |
| `SHOPIFY_API_SECRET` | ✅ | From Partner Dashboard |
| `SHOPIFY_APP_URL` | ✅ | Auto-set by `shopify app dev`; set manually in prod |
| `SCOPES` | ✅ | Copy from `.env.example` |
| `CRON_SECRET` | ✅ | Bearer token for `POST /cron/process-jobs` |
| `WHATSAPP_TOKEN` | WhatsApp module | Meta Cloud API token |
| `WHATSAPP_PHONE_ID` | WhatsApp module | Phone number ID |
| `TALLY_BRIDGE_URL` | Tally module | Fallback if not set per-shop in UI |
| `SHIPROCKET_TOKEN` | Returns module | Shiprocket JWT |

---

## Project layout

```
app/
  plans.ts                          Shared plan constants (client + server safe)
  shopify.server.ts                 Shopify auth, billing config, session storage
  db.server.ts                      Prisma singleton

  models/
    automation.server.ts            getConfig / saveConfig / listStatuses
    audit.server.ts                 logAudit / recentEvents / failuresSince
    health.server.ts                recordRun / storeHealth
    job.server.ts                   enqueue / claimDueJobs / markDone / markFailed
    subscription.server.ts          getSubscription / upsertSubscription
    customer.server.ts              upsertContact / exportCustomer / redactCustomer / redactShop

  services/
    tally.server.ts                 buildVoucherXml / pushVoucher
    whatsapp.server.ts              sendCodVerification (Meta Cloud API)
    courier.server.ts               createReturnPickup (Shiprocket)
    inventory.server.ts             normalizeSku / availableWithBuffer / applySync
    queue.server.ts                 processDueJobs (claims + retries with backoff)

  routes/
    app.tsx                         Embedded shell + 6-item nav
    app._index.tsx                  Dashboard: real health, statuses, shop metrics
    app.tally.tsx                   Tally config (enable toggle + settings)
    app.whatsapp.tsx                WhatsApp config (enable toggle + timings)
    app.returns.tsx                 Returns config (courier + window)
    app.inventory.tsx               Inventory config (enable + safety buffer)
    app.settings.tsx                INR plans + Shopify billing
    cron.process-jobs.tsx           Drain job queue (secured by CRON_SECRET)
    webhooks.orders.create.tsx      Enqueue Tally push + WhatsApp verification
    webhooks.inventory.update.tsx   Enqueue inventory sync
    webhooks.customers.data_request.tsx   GDPR data export
    webhooks.customers.redact.tsx         GDPR customer erase
    webhooks.shop.redact.tsx              GDPR shop erase (post-uninstall)
    webhooks.app.uninstalled.tsx          Delete sessions
    webhooks.app.scopes_update.tsx        Handle scope changes

prisma/
  schema.prisma                     6 models: Session, AutomationConfig, AuditLog,
                                    AutomationHealth, Job, Subscription, CustomerContact
  migrations/
    20260627_001_threxa_schema/migration.sql   Full schema DDL

docs/
  privacy-policy.md                 GDPR + DPDP compliant privacy policy
  terms-of-service.md               ToS with INR billing terms
  app-store-listing.md              Listing copy + screenshots guide + submission checklist
```

---

## Job queue and retry

Webhooks enqueue jobs into the `Job` table. `processDueJobs()` runs inline after each webhook for low volume, and is also available at `POST /cron/process-jobs` for a scheduler.

Failed jobs retry with exponential backoff (30s → 60s → 2m → 4m → 8m → permanent fail). Every attempt writes an `AuditLog` row. Health is recalculated from real failure counts, not a drifting counter.

---

## Adding a new integration

1. Add a handler to `app/services/` that accepts `(shop, payload)` and returns `HandlerResult`
2. Register the handler in the `HANDLERS` map in `queue.server.ts`
3. Call `enqueue({ type: "your.handler", ... })` from the relevant webhook route
4. Add the webhook subscription to `shopify.app.toml`

---

## Scripts

```bash
npm run dev          # shopify app dev
npm run build        # react-router build (client + server)
npm run typecheck    # react-router typegen + tsc --noEmit
npm run lint         # eslint
npm test             # vitest (11 tests)
npm run setup        # prisma generate + migrate deploy
npm run deploy       # shopify app deploy (App Store)
```

---

## Verified gates

| Gate | Status |
|---|---|
| `npm run typecheck` | ✅ clean |
| `npm run lint` | ✅ clean |
| `npm run build` | ✅ client + server bundles built |
| `npm test` | ✅ 11/11 pass |
| Live Shopify dev loop | requires your credentials (run `npm run dev`) |
| Prisma runtime engine | requires network (run `npm run setup`) |

---

## Deployment

Recommended hosts: **Render, Railway, Fly.io** (all support Node + SQLite or Postgres).

1. Push to GitHub
2. Connect to your host, set environment variables from `.env.example`
3. Build command: `npm run setup && npm run build`
4. Start command: `npm run start`
5. Set `SHOPIFY_APP_URL` to your host's public domain
6. Run `shopify app config link` to update `shopify.app.toml` with the live URL

For production, swap SQLite for Postgres by changing `schema.prisma` datasource to `postgresql` and updating `DATABASE_URL`.

---

## App Store submission

See `docs/app-store-listing.md` for:
- Full listing copy (description, tagline, key benefits)
- Screenshot guide (6 screenshots, what to show in each)
- Pre-submission checklist (technical, compliance, legal, billing)
- Protected data (`read_customers`) approval instructions — **start this 2–4 weeks before you plan to submit**

---

## Support

Sachin Kalaiselvan · sachin@theingredientlist.co  
theingredientlist.co · threxa.theingredientlist.co
