# Threxa — Shopify App Store Listing

---

## App name
Threxa — D2C Automation for Indian Brands

## Tagline (≤ 100 chars)
Tally sync, WhatsApp COD, returns & inventory — built for Indian D2C.

---

## Short description (≤ 150 chars for the App Store card)
Automate reconciliation into Tally Prime, verify COD orders on WhatsApp, manage returns with India couriers, and sync inventory in real time.

---

## Full description

### Stop doing manually what Threxa does automatically

Threxa bundles the four operations that consume the most time in a growing Indian D2C store — and delivers them as a single, flat-INR-priced Shopify app.

---

#### Tally reconciliation
Every paid order and refund becomes a GST-ready sales voucher in Tally Prime within seconds of the order being placed. No manual data entry, no missed transactions, no GSTR-3B scramble at month end.

- Supports Tally Prime (and ERP9 via the same bridge)
- Pushes 42+ data points including tax breakdowns
- Every push is logged — if something fails, you know immediately and it retries automatically

---

#### WhatsApp COD verification
Threxa uses the **official WhatsApp Business Cloud API** — never device-linking. Competitors that link devices get their merchants' numbers permanently banned by Meta. Threxa doesn't.

- Sends a verification message the moment a COD order is placed
- Sends a reminder at a configurable interval (default: 15 minutes)
- Auto-cancels unverified orders after a configurable timeout (default: 60 minutes)
- Auto-tags confirmed / cancelled orders in Shopify

---

#### Returns management
A branded self-service returns portal your customers reach from your store. Exchange-first flow to retain revenue. Pickup integrations with Shiprocket, Delhivery, and Blue Dart — the three largest India return couriers.

- Customer raises return → courier pickup auto-created
- Restock is idempotent: processed exactly once, no duplicate inventory additions
- Full return reason analytics

---

#### Inventory sync
Webhook-driven, real-time sync. Not hourly batches — the moment an order is placed or cancelled, stock is updated. SKUs are normalised before matching so case differences and extra whitespace never cause a silent mismatch.

- Configurable safety-stock buffer to prevent overselling on flash sales
- Full audit trail: every change logged with its source
- App never zeroes stock on uninstall

---

### Pricing
Flat INR pricing — no per-order fees, no per-message fees, no surprise charges at month end.

| Plan | Price | For |
|---|---|---|
| Launch | ₹8,000 / mo | 1 automation, up to 1,000 orders/mo |
| Growth | ₹16,000 / mo | All 4 automations, up to 5,000 orders/mo |
| Pro | ₹45,000 / mo | Unlimited + priority founder support |

---

### Support
Founder-led support. Reply within the same business day (IST).  
WhatsApp: +91 74839 92418  
Email: sachin@theingredientlist.co  
Docs: https://threxa.theingredientlist.co/docs

---

## Key benefits (bullet list for the App Store)
- GST-ready Tally vouchers created automatically on every order
- COD verification via official WhatsApp API — no Meta bans
- Returns portal with Shiprocket, Delhivery, Blue Dart pickups
- Real-time inventory sync with safety-stock buffer to stop overselling
- Full audit log — you always know what ran, when, and whether it succeeded
- Flat INR pricing — no surprise USD usage fees
- Same-day support from the founder

---

## Categories
- Orders and shipping
- Inventory management
- Accounting

---

## Screenshots needed (take these on your dev store)

1. **Home dashboard** — automation cards showing Active/Set up badges, system health panel, overview metrics (orders, products, active count)
2. **Tally page** — config form with enable toggle, company name, bridge URL, voucher type
3. **WhatsApp page** — official API banner, enable toggle, reminder/auto-cancel config
4. **Returns page** — courier selector (Shiprocket / Delhivery / Blue Dart), window config
5. **Inventory page** — safety-stock buffer field, safeguards aside panel
6. **Settings page** — three INR plan cards side by side with "Choose" buttons

Recommended size: 1600 × 900 px, PNG, light background.

---

## App listing URLs to fill in before submission
- **App URL:** https://your-hosting-domain.com/app (Render / Railway / Fly.io)
- **Redirect URLs:** https://your-hosting-domain.com/auth/callback
- **Privacy policy:** https://threxa.theingredientlist.co/privacy (or host docs/privacy-policy.md)
- **Terms of service:** https://threxa.theingredientlist.co/terms (or host docs/terms-of-service.md)
- **Support email:** sachin@theingredientlist.co

---

## Pre-submission review checklist

### Technical
- [ ] All 3 GDPR compliance webhooks registered and returning 200
- [ ] `customers/data_request` handler logs and delivers customer data
- [ ] `customers/redact` handler deletes customer PII from `CustomerContact`
- [ ] `shop/redact` handler deletes all shop data within 48h of uninstall
- [ ] App loads in ≤ 3s on a dev store (test in Chrome DevTools)
- [ ] No console errors in the embedded admin
- [ ] All 6 routes render correctly (Home, Tally, WhatsApp, Returns, Inventory, Settings)
- [ ] Plan upgrade triggers Shopify billing approval screen
- [ ] At least one full end-to-end test: place COD order → WhatsApp message → Tally voucher
- [ ] Cron job configured to drain the retry queue every 5 minutes

### Protected data approval (DO THIS FIRST — can take 2-4 weeks)
- [ ] Request `read_customers` approval in Shopify Partner Dashboard
- [ ] Complete the data-protection questionnaire
- [ ] Receive approval email before submitting the app

### Legal
- [ ] Privacy policy publicly accessible at a stable URL
- [ ] Terms of service publicly accessible at a stable URL
- [ ] Contact email responds within 2 business days (Shopify tests this)

### Listing
- [ ] 6 screenshots uploaded (1600×900 PNG)
- [ ] App icon uploaded (512×512 PNG, no text, no Shopify logo)
- [ ] Full description ≤ 2,800 chars (currently within limit)
- [ ] Tagline ≤ 100 chars ✓
- [ ] Support URL / email filled in
- [ ] Category set: Orders and shipping + Accounting

### Billing
- [ ] Test the billing flow end-to-end on a dev store (isTest: true)
- [ ] Confirm plan names exactly match the `billing` config in `shopify.server.ts`
- [ ] Confirm plans display correctly in Settings page

---

## Post-launch: first 30 days

1. **Email every install** within 24h asking for feedback
2. **Watch the audit log** for any automation failures; fix and reply same day
3. **Ask for a review** after a merchant's first successful Tally sync or COD verification
4. Reply to every App Store review within 48h
5. Use negative reviews from competitors (slow support, surprise charges, number bans) as your differentiation talking points in support responses
