# threxa-shopify-app

d2c automation for indian shopify brands. four modules: **tally reconciliation**, **whatsapp COD confirmation**, **returns**, **inventory sync**.

## quick start

```bash
npm install
shopify auth login          # pick your org + dev store
cp .env.example .env        # SHOPIFY_API_KEY + SHOPIFY_API_SECRET
npm run setup               # prisma generate + migrate
npm run dev                 # shopify app dev, installs on the dev store + opens the browser
```

`shopify app dev` fills in `client_id`, `application_url`, `redirect_urls` in `shopify.app.toml` for you.

## env

| var | needed for | what |
|---|---|---|
| `SHOPIFY_API_KEY` | always | partner dashboard |
| `SHOPIFY_API_SECRET` | always | partner dashboard |
| `SHOPIFY_APP_URL` | always | auto-set by `shopify app dev`, set it yourself in prod |
| `SCOPES` | always | copy from `.env.example` |
| `CRON_SECRET` | always | bearer token for `POST /cron/process-jobs` |
| `WHATSAPP_TOKEN` | whatsapp | meta cloud API token |
| `WHATSAPP_PHONE_ID` | whatsapp | phone number id |
| `TALLY_BRIDGE_URL` | tally | fallback if a shop hasn't set one in the UI |
| `SHIPROCKET_TOKEN` | returns | shiprocket JWT |

## layout

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

## jobs + retries

webhooks drop jobs into the `Job` table. `processDueJobs()` runs inline after each webhook (fine at low volume), and `POST /cron/process-jobs` is there for a scheduler.

failed jobs back off 30s → 60s → 2m → 4m → 8m → give up. every attempt writes an `AuditLog` row. health is worked out from actual failure counts, not some counter that drifts.

## adding an integration

1. handler in `app/services/` taking `(shop, payload)` and returning `HandlerResult`
2. register it in `HANDLERS` in `queue.server.ts`
3. `enqueue({ type: "your.handler", ... })` from the webhook route
4. add the webhook subscription to `shopify.app.toml`

## scripts

```bash
npm run dev          # shopify app dev
npm run build        # react-router build (client + server)
npm run typecheck    # typegen + tsc --noEmit
npm run lint
npm test             # vitest, 11 tests
npm run setup        # prisma generate + migrate deploy
npm run deploy       # shopify app deploy
```

typecheck, lint, build and all 11 tests pass. the live shopify dev loop + prisma's runtime engine need your creds / network, so run `npm run dev` and `npm run setup` yourself.

## deploying

render, railway or fly all work (node + sqlite or postgres).

1. push to github
2. connect the host, set env from `.env.example`
3. build: `npm run setup && npm run build`
4. start: `npm run start`
5. `SHOPIFY_APP_URL` = your public domain
6. `shopify app config link` to put the live url in `shopify.app.toml`

for prod swap sqlite for postgres: `schema.prisma` datasource → `postgresql`, update `DATABASE_URL`.

## app store

`docs/app-store-listing.md` has the listing copy, which 6 screenshots to take, and the pre-submission checklist. the protected data (`read_customers`) approval takes a while, **start it 2-4 weeks before you submit**.

sachin · sachin@theingredientlist.co · threxa.theingredientlist.co
