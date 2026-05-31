import { env } from "../config/env.js";

export function calculateCartTotals(items, coupon = null) {
  const activeItems = items.filter((i) => !i.savedForLater);
  const subtotal = activeItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  let discount = 0;
  if (coupon && coupon.active) {
    if (coupon.minPurchase && subtotal < Number(coupon.minPurchase)) {
      discount = 0;
    } else if (coupon.type === "PERCENTAGE") {
      discount = (subtotal * Number(coupon.value)) / 100;
    } else {
      discount = Number(coupon.value);
    }
    discount = Math.min(discount, subtotal);
  }

  const taxable = Math.max(0, subtotal - discount);
  const tax = taxable * env.TAX_RATE;
  const shipping =
    taxable >= env.FREE_SHIPPING_MIN ? 0 : env.SHIPPING_FLAT;
  const total = taxable + tax + shipping;

  return {
    subtotal: +subtotal.toFixed(2),
    discount: +discount.toFixed(2),
    tax: +tax.toFixed(2),
    shipping: +shipping.toFixed(2),
    total: +total.toFixed(2),
    itemCount: activeItems.reduce((s, i) => s + i.quantity, 0),
  };
}
