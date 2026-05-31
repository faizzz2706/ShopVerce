import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { userApi, orderApi } from "../api";
import { fetchCart, clearCartState } from "../store/cartSlice";

const STEPS = ["Address", "Review", "Payment"];

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cart, totals } = useSelector((s) => s.cart);
  const [step, setStep] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [shippingId, setShippingId] = useState("");
  const [billingId, setBillingId] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("mock");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchCart());
    userApi.addresses().then((r) => {
      setAddresses(r.data.data);
      const defaultAddr = r.data.data.find((a) => a.isDefault);
      if (defaultAddr) {
        setShippingId(defaultAddr.id);
        setBillingId(defaultAddr.id);
      }
    });
  }, [dispatch]);

  const activeItems = cart?.items?.filter((i) => !i.savedForLater) || [];

  const placeOrder = async () => {
    if (!shippingId) return toast.error("Select shipping address");
    setLoading(true);
    try {
      const { data } = await orderApi.create({
        shippingAddressId: shippingId,
        billingAddressId: billingId || shippingId,
        couponCode: couponCode || undefined,
        paymentMethod,
        notes: "",
      });
      dispatch(clearCartState());
      toast.success("Order placed successfully!");
      navigate(`/orders/${data.data.order.id}/confirmation`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (!activeItems.length) {
    return (
      <div className="mx-auto max-w-7xl p-8 text-center">
        <p>Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-3 py-4 sm:px-4 sm:py-6">
      <h1 className="text-xl font-bold sm:text-2xl">Checkout</h1>

      <div className="mt-4 flex gap-1 sm:mt-6 sm:gap-2">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`flex-1 rounded-lg py-2 text-center text-xs font-medium sm:text-sm ${
              i <= step ? "bg-primary-600 text-white" : "bg-gray-200 dark:bg-gray-800"
            }`}
          >
            {i + 1}. {s}
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border bg-white p-4 sm:mt-8 sm:p-6 dark:border-gray-800 dark:bg-gray-900">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-semibold">Shipping Address</h2>
            {addresses.map((addr) => (
              <label
                key={addr.id}
                className={`flex cursor-pointer gap-3 rounded-lg border p-4 ${
                  shippingId === addr.id ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20" : ""
                }`}
              >
                <input
                  type="radio"
                  name="shipping"
                  checked={shippingId === addr.id}
                  onChange={() => {
                    setShippingId(addr.id);
                    setBillingId(addr.id);
                  }}
                />
                <div>
                  <p className="font-medium">{addr.label || addr.type}</p>
                  <p className="text-sm text-gray-600">
                    {addr.street}, {addr.city}, {addr.state} {addr.zip}
                  </p>
                </div>
              </label>
            ))}
            {addresses.length === 0 && (
              <p className="text-sm text-gray-500">
                No addresses saved.{" "}
                <a href="/profile" className="text-primary-600">
                  Add one in your profile
                </a>
              </p>
            )}
            <button
              onClick={() => setStep(1)}
              disabled={!shippingId}
              className="w-full rounded-lg bg-primary-600 py-3 text-white disabled:opacity-50"
            >
              Continue to Review
            </button>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="font-semibold">Order Review</h2>
            <ul className="mt-4 space-y-2">
              {activeItems.map((item) => (
                <li key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.product.name} x {item.quantity}
                  </span>
                  <span>₹{(Number(item.product.price) * item.quantity).toLocaleString()}</span>
                </li>
              ))}
            </ul>
            {totals && (
              <dl className="mt-4 space-y-1 border-t pt-4 text-sm">
                <div className="flex justify-between font-bold text-lg">
                  <dt>Total</dt>
                  <dd>₹{totals.total?.toLocaleString()}</dd>
                </div>
              </dl>
            )}
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Coupon code (optional)"
              className="mt-4 w-full rounded-lg border px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
            />
            <div className="mt-4 flex gap-3">
              <button onClick={() => setStep(0)} className="flex-1 rounded-lg border py-3">
                Back
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-1 rounded-lg bg-primary-600 py-3 text-white"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-semibold">Payment</h2>
            <div className="mt-4 space-y-3">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4">
                <input
                  type="radio"
                  checked={paymentMethod === "mock"}
                  onChange={() => setPaymentMethod("mock")}
                />
                <div>
                  <p className="font-medium">Mock Payment (Demo)</p>
                  <p className="text-sm text-gray-500">Instant confirmation for testing</p>
                </div>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 opacity-75">
                <input
                  type="radio"
                  checked={paymentMethod === "stripe"}
                  onChange={() => setPaymentMethod("stripe")}
                />
                <div>
                  <p className="font-medium">Stripe (Card)</p>
                  <p className="text-sm text-gray-500">Requires STRIPE_SECRET_KEY in .env</p>
                </div>
              </label>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 rounded-lg border py-3">
                Back
              </button>
              <button
                onClick={placeOrder}
                disabled={loading}
                className="flex-1 rounded-lg bg-primary-600 py-3 font-medium text-white disabled:opacity-50"
              >
                {loading ? "Processing..." : `Pay ₹${totals?.total?.toLocaleString()}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
