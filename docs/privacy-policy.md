# Threxa — Privacy Policy

**Last updated: 27 June 2026**  
**Data controller: Sachin Kalaiselvan, The Ingredient List, Bengaluru, India**  
Contact: sachin@theingredientlist.co | +91 74839 92418

---

## 1. What Threxa is

Threxa is a Shopify embedded app that automates four workflows for Indian D2C merchants: Tally ERP reconciliation, WhatsApp COD verification, returns management, and inventory sync. Threxa does not operate a storefront and does not collect data from end consumers directly.

## 2. Data we collect and why

### 2.1 Shop and session data
When a merchant installs Threxa, Shopify sends us:
- Shop domain, name, email, and currency
- An OAuth access token scoped to the permissions you grant

We store this to authenticate API calls on your behalf. This is session data, not personal data of your customers.

### 2.2 Order data
Threxa reads order information (order ID, amount, payment method, fulfilment status) to:
- Push sales vouchers to Tally Prime
- Detect Cash-on-Delivery orders for WhatsApp verification

We do not store full order records. We log a reference ID and status per action for audit purposes.

### 2.3 Customer contact data (minimal, isolated)
For WhatsApp COD verification we store a customer's **phone number** and, optionally, **email address** keyed to their Shopify customer ID. This is the only customer PII Threxa holds. We store no payment details, addresses, or purchase history.

### 2.4 Automation configuration
The settings you configure inside the app (Tally company name, bridge URL, return window, safety-stock buffer) are stored per shop.

### 2.5 Audit logs
Every action the app takes (voucher pushed, verification sent, sync applied) is logged with its status, timestamp, and source. Logs do not contain customer personal data beyond a Shopify-issued reference ID.

---

## 3. How we use your data

| Data | Purpose | Legal basis |
|---|---|---|
| Shop session | Authenticate Shopify API calls | Contractual necessity |
| Order reference IDs | Tally push, audit trail | Contractual necessity |
| Customer phone/email | WhatsApp COD verification | Contractual necessity (merchant enables this) |
| Automation config | Deliver the service | Contractual necessity |
| Audit logs | Transparency, debugging, compliance | Legitimate interest |

We do not sell any data. We do not use your data for advertising.

---

## 4. Data sharing

We share data only with:

- **Shopify** — to make API calls on your behalf (their privacy policy applies)
- **WhatsApp Business Platform (Meta)** — customer phone number is sent when you send a verification message (Meta's Cloud API terms apply)
- **Tally Prime** — order data is sent to the bridge you configure and run on your own machine; Threxa never directly accesses your Tally installation
- **Shiprocket / Delhivery / Blue Dart** — return pickup data is sent when you enable the returns automation (their respective privacy policies apply)

No data is shared with any other third party.

---

## 5. Data retention

| Data | Retained for |
|---|---|
| Session tokens | Until the app is uninstalled + 48 hours |
| Audit logs | 90 days, then automatically deleted |
| Customer phone/email | Until you delete the record in the app, or 48h after uninstall |
| Job queue records | 30 days after completion |
| Automation config | Until uninstall + 48h |

---

## 6. Your rights (GDPR / Indian DPDP Act 2023)

As a merchant you can:

- **Access** — request a copy of all data we hold for your shop
- **Rectification** — update any config or contact data via the app
- **Erasure** — delete all app data by uninstalling Threxa; we process the `shop/redact` webhook within 48 hours
- **Data portability** — on request we will provide your audit log and config in JSON

Your customers can exercise their GDPR rights by contacting you as the data controller. When you receive a `customers/data_request` or `customers/redact` webhook from Shopify, Threxa processes it automatically and erases the relevant phone/email record.

To exercise your rights: sachin@theingredientlist.co

---

## 7. Security

- All data in transit uses TLS 1.2+
- Shopify webhook payloads are signature-verified before processing
- Access tokens are stored encrypted at rest
- We never device-link WhatsApp; we use the official Meta Cloud API with an approved BSP

---

## 8. Changes to this policy

We will notify you of material changes via the Shopify admin notification system and by updating the "last updated" date above. Continued use of Threxa after notification constitutes acceptance.

---

## 9. Contact

**Sachin Kalaiselvan**  
The Ingredient List  
Bengaluru, Karnataka, India  
sachin@theingredientlist.co  
+91 74839 92418
