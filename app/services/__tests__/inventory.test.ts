import { describe, it, expect } from "vitest";
import { normalizeSku, availableWithBuffer } from "../inventory.server";

describe("normalizeSku", () => {
  it("lowercases and trims", () => {
    expect(normalizeSku("  RED-SHIRT-L  ")).toBe("red-shirt-l");
  });
  it("handles empty string", () => {
    expect(normalizeSku("")).toBe("");
  });
});

describe("availableWithBuffer", () => {
  it("subtracts safety stock from on-hand", () => {
    expect(availableWithBuffer(10, 2)).toBe(8);
  });
  it("never goes below zero", () => {
    expect(availableWithBuffer(1, 5)).toBe(0);
  });
  it("zero buffer returns on-hand", () => {
    expect(availableWithBuffer(50, 0)).toBe(50);
  });
  it("exact match returns zero not negative", () => {
    expect(availableWithBuffer(3, 3)).toBe(0);
  });
});
