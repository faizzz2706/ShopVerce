import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { orderApi } from "../api";

const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-indigo-100 text-indigo-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  RETURN_REQUESTED: "bg-orange-100 text-orange-800",
  RETURNED: "bg-gray-100 text-gray-800",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.list().then((r) => {
      setOrders(r.data.data);
      setLoading(false);
    });
  }, []);

  const cancelOrder = async (id) => {
    if (!confirm("Cancel this order?")) return;
    await orderApi.cancel(id);
    const { data } = await orderApi.list();
    setOrders(data.data);
  };

  if (loading) return <div className="p-8 text-center">Loading orders...</div>;

  return (
    <div className="mx-auto max-w-4xl px-3 py-4 sm:px-4 sm:py-6">
      <h1 className="text-xl font-bold sm:text-2xl">My Orders</h1>
      <div className="mt-6 space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-xl border bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium">{order.orderNumber}</p>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[order.status]}`}
              >
                {order.status}
              </span>
              <p className="font-bold">₹{Number(order.total).toLocaleString()}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                to={`/orders/${order.id}`}
                className="text-sm text-primary-600 hover:underline"
              >
                View Details
              </Link>
              {["PENDING", "CONFIRMED"].includes(order.status) && (
                <button
                  onClick={() => cancelOrder(order.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Cancel
                </button>
              )}
              {order.status === "DELIVERED" && (
                <button
                  onClick={async () => {
                    const reason = prompt("Reason for return?");
                    if (reason) {
                      await orderApi.return(order.id, reason);
                      const { data } = await orderApi.list();
                      setOrders(data.data);
                    }
                  }}
                  className="text-sm text-orange-600 hover:underline"
                >
                  Request Return
                </button>
              )}
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <p className="text-center text-gray-500">No orders yet</p>
        )}
      </div>
    </div>
  );
}
