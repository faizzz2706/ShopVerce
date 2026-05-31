import { describe, it } from "node:test";
import assert from "node:assert";

describe("Health check", () => {
  it("should pass basic assertion", () => {
    assert.strictEqual(1 + 1, 2);
  });

  it("should validate order number format", async () => {
    const { generateOrderNumber } = await import("../src/utils/orderNumber.js");
    const num = generateOrderNumber();
    assert.ok(num.startsWith("SV-"));
  });
});

describe("Cart totals", () => {
  it("should calculate totals correctly", async () => {
    const { calculateCartTotals } = await import("../src/utils/cartTotals.js");
    const items = [
      {
        quantity: 2,
        savedForLater: false,
        product: { price: 100 },
      },
    ];
    const totals = calculateCartTotals(items);
    assert.strictEqual(totals.subtotal, 200);
    assert.ok(totals.tax > 0);
    assert.ok(totals.total > totals.subtotal);
  });
});
