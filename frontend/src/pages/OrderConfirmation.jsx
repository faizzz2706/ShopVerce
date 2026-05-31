import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { orderApi } from "../api";

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    orderApi.get(id).then((r) => setOrder(r.data.data));
  }, [id]);

  if (!order) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-center">
      <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
      <h1 className="mt-4 text-3xl font-bold">Order Confirmed!</h1>
      <p className="mt-2 text-gray-600">
        Thank you for your purchase. Order <strong>{order.orderNumber}</strong> has been placed.
      </p>
      <p className="mt-1 text-2xl font-bold text-primary-600">
        ₹{Number(order.total).toLocaleString()}
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Link
          to={`/orders/${order.id}`}
          className="rounded-lg border px-6 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          View Order
        </Link>
        <Link
          to="/shop"
          className="rounded-lg bg-primary-600 px-6 py-2 text-white hover:bg-primary-700"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
