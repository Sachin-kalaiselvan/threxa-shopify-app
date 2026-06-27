import type { HandlerResult } from "./types";

interface OrderPayload {
  id: string | number;
  name?: string;
  total_price?: string;
  currency?: string;
  created_at?: string;
}

// Builds a Tally Prime import envelope for a sales voucher. Tally consumes XML
// over HTTP at its gateway; merchants run a small bridge that forwards to it.
export function buildVoucherXml(
  companyName: string,
  voucherType: string,
  order: OrderPayload,
): string {
  const date = (order.created_at ?? new Date().toISOString()).slice(0, 10).replace(/-/g, "");
  const amount = order.total_price ?? "0";
  const ref = order.name ?? String(order.id);
  return `<ENVELOPE>
  <HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER>
  <BODY><IMPORTDATA>
    <REQUESTDESC><REPORTNAME>Vouchers</REPORTNAME>
      <STATICVARIABLES><SVCURRENTCOMPANY>${companyName}</SVCURRENTCOMPANY></STATICVARIABLES>
    </REQUESTDESC>
    <REQUESTDATA>
      <TALLYMESSAGE>
        <VOUCHER VCHTYPE="${voucherType}" ACTION="Create">
          <DATE>${date}</DATE>
          <VOUCHERTYPENAME>${voucherType}</VOUCHERTYPENAME>
          <REFERENCE>${ref}</REFERENCE>
          <AMOUNT>${amount}</AMOUNT>
        </VOUCHER>
      </TALLYMESSAGE>
    </REQUESTDATA>
  </IMPORTDATA></BODY>
</ENVELOPE>`;
}

export async function pushVoucher(
  _shop: string,
  payload: { order: OrderPayload; config?: { companyName?: string; voucherType?: string; bridgeUrl?: string } },
): Promise<HandlerResult> {
  const cfg = payload.config ?? {};
  const bridgeUrl = cfg.bridgeUrl || process.env.TALLY_BRIDGE_URL;
  if (!bridgeUrl || !cfg.companyName) {
    return { skipped: true, message: "Tally bridge URL or company not configured" };
  }
  const xml = buildVoucherXml(cfg.companyName, cfg.voucherType || "Sales", payload.order);
  const res = await fetch(bridgeUrl, {
    method: "POST",
    headers: { "Content-Type": "application/xml" },
    body: xml,
  });
  if (!res.ok) {
    throw new Error(`Tally bridge responded ${res.status}`);
  }
  return { refId: String(payload.order.id), message: "Voucher pushed to Tally" };
}
