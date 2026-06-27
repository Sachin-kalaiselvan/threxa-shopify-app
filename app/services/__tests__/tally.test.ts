import { describe, it, expect } from "vitest";
import { buildVoucherXml } from "../tally.server";

const ORDER = {
  id: 12345,
  name: "#1001",
  total_price: "1999.00",
  currency: "INR",
  created_at: "2026-06-27T10:00:00Z",
};

describe("buildVoucherXml", () => {
  it("produces XML with the correct voucher type", () => {
    const xml = buildVoucherXml("My Company", "Sales", ORDER);
    expect(xml).toContain('VCHTYPE="Sales"');
  });

  it("embeds the order reference", () => {
    const xml = buildVoucherXml("My Company", "Sales", ORDER);
    expect(xml).toContain("<REFERENCE>#1001</REFERENCE>");
  });

  it("includes the amount", () => {
    const xml = buildVoucherXml("My Company", "Sales", ORDER);
    expect(xml).toContain("<AMOUNT>1999.00</AMOUNT>");
  });

  it("formats date as YYYYMMDD", () => {
    const xml = buildVoucherXml("My Company", "Sales", ORDER);
    expect(xml).toContain("<DATE>20260627</DATE>");
  });

  it("embeds the company name", () => {
    const xml = buildVoucherXml("My Company", "Sales", ORDER);
    expect(xml).toContain("<SVCURRENTCOMPANY>My Company</SVCURRENTCOMPANY>");
  });
});
