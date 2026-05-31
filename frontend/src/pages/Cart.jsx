import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Trash2, Bookmark } from "lucide-react";
import { fetchCart } from "../store/cartSlice";
import { cartApi } from "../api";

export default function Cart() {
  const dispatch = useDispatch();
  const { cart, totals, loading } = useSelector((s) => s.cart);
  const [couponCode, setCouponCode] = useState("");

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const activeItems = cart?.items?.filter((i) => !i.savedForLater) || [];
  const savedItems = cart?.items?.filter((i) => i.savedForLater) || [];

  const updateQty = async (itemId, quantity) => {
    await cartApi.update(itemId, { quantity });
    dispatch(fetchCart(couponCode));
  };

  const removeItem = async (itemId) => {
    await cartApi.remove(itemId);
    toast.success("Removed from cart");
    dispatch(fetchCart(couponCode));
  };

  const toggleSave = async (itemId, savedForLater) => {
    await cartApi.update(itemId, { savedForLater });
    dispatch(fetchCart(couponCode));
  };

  const applyCoupon = async () => {
    try {
      await cartApi.validateCoupon(couponCode);
      dispatch(fetchCart(couponCode));
      toast.success("Coupon applied!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid coupon");
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-7xl p-8 text-center">Loading cart...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
      <h1 className="text-xl font-bold sm:text-2xl">Shopping Cart</h1>

      {activeItems.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-gray-500">Your cart is empty</p>
          <Link to="/shop" className="mt-4 inline-block text-primary-600 hover:underline">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-4 grid gap-6 lg:mt-6 lg:grid-cols-3 lg:gap-8">
          <div className="space-y-4 lg:col-span-2">
            {activeItems.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onUpdateQty={updateQty}
                onRemove={removeItem}
                onToggleSave={toggleSave}
              />
            ))}

            {savedItems.length > 0 && (
              <>
                <h2 className="mt-8 text-lg font-semibold">Saved for Later</h2>
                {savedItems.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    saved
                    onUpdateQty={updateQty}
                    onRemove={removeItem}
                    onToggleSave={toggleSave}
                  />
                ))}
              </>
            )}
          </div>

          <div className="h-fit rounded-xl border bg-white p-4 sm:p-6 lg:sticky lg:top-24 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="font-semibold">Order Summary</h2>
            <div className="mt-4 flex gap-2">
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Coupon code"
                className="flex-1 rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
              <button
                onClick={applyCoupon}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white dark:bg-gray-100 dark:text-gray-900"
              >
                Apply
              </button>
            </div>
            {totals && (
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd>₹{totals.subtotal?.toLocaleString()}</dd>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <dt>Discount</dt>
                    <dd>-₹{totals.discount?.toLocaleString()}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt>Tax (GST)</dt>
                  <dd>₹{totals.tax?.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Shipping</dt>
                  <dd>{totals.shipping === 0 ? "FREE" : `₹${totals.shipping}`}</dd>
                </div>
                <div className="flex justify-between border-t pt-2 text-lg font-bold">
                  <dt>Total</dt>
                  <dd>₹{totals.total?.toLocaleString()}</dd>
                </div>
              </dl>
            )}
            <Link
              to="/checkout"
              className="mt-6 block w-full rounded-lg bg-primary-600 py-3 text-center font-medium text-white hover:bg-primary-700"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function CartItemRow({ item, saved, onUpdateQty, onRemove, onToggleSave }) {
  const img = item.product.images?.[0]?.url;
  return (
    <div className="flex gap-3 rounded-xl border bg-white p-3 sm:gap-4 sm:p-4 dark:border-gray-800 dark:bg-gray-900">
      <img src={img} alt="" className="h-20 w-20 shrink-0 rounded-lg object-cover sm:h-24 sm:w-24" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Link to={`/product/${item.product.slug}`} className="font-medium hover:text-primary-600">
          {item.product.name}
        </Link>
        <p className="text-lg font-bold">₹{Number(item.product.price).toLocaleString()}</p>
        <div className="mt-auto flex flex-wrap items-center gap-2 sm:gap-3">
          {!saved && (
            <div className="flex items-center rounded border">
              <button
                onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                className="px-2 py-1"
                disabled={item.quantity <= 1}
              >
                -
              </button>
              <span className="px-3">{item.quantity}</span>
              <button
                onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                className="px-2 py-1"
              >
                +
              </button>
            </div>
          )}
          <button
            onClick={() => onToggleSave(item.id, !saved)}
            className="text-sm text-gray-500 hover:text-primary-600"
          >
            <Bookmark className="inline h-4 w-4" /> {saved ? "Move to Cart" : "Save for Later"}
          </button>
          <button onClick={() => onRemove(item.id)} className="text-red-500 hover:text-red-700">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
