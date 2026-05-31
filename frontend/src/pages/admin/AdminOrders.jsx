import { useEffect, useState } from "react";
import { adminApi } from "../../api";
import toast from "react-hot-toast";

const STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  const load = () => adminApi.orders({ limit: 50 }).then((r) => setOrders(r.data.data));

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    await adminApi.updateOrderStatus(id, { status, note: `Updated to ${status}` });
    toast.success("Order status updated");
    load();
  };

  return (
    <div>
      <h1 className="text-xl font-bold sm:text-2xl">Orders</h1>
      <div className="mt-6 space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-xl border bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium">{order.orderNumber}</p>
                <p className="text-sm text-gray-500">{order.user?.email}</p>
              </div>
              <p className="font-bold">₹{Number(order.total).toLocaleString()}</p>
              <select
                value={order.status}
                onChange={(e) => updateStatus(order.id, e.target.value)}
                className="rounded-lg border px-3 py-1 text-sm dark:border-gray-700 dark:bg-gray-800"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <ul className="mt-2 text-sm text-gray-600">
              {order.items?.map((item) => (
                <li key={item.id}>
                  {item.name} x {item.quantity}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
