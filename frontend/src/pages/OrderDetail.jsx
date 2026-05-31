import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { orderApi } from "../api";
import { Package, Check } from "lucide-react";

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    orderApi.get(id).then((r) => setOrder(r.data.data));
  }, [id]);

  if (!order) return <div className="p-8 text-center">Loading...</div>;

  const statuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
  const currentIdx = statuses.indexOf(order.status);

  return (
    <div className="mx-auto max-w-4xl px-3 py-4 sm:px-4 sm:py-6">
      <h1 className="text-lg font-bold sm:text-2xl">Order {order.orderNumber}</h1>

      {/* Timeline */}
      <div className="mt-6 flex justify-between gap-1 overflow-x-auto sm:mt-8">
        {statuses.map((s, i) => (
          <div key={s} className="flex flex-col items-center flex-1">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                i <= currentIdx ? "bg-primary-600 text-white" : "bg-gray-200 dark:bg-gray-800"
              }`}
            >
              {i <= currentIdx ? <Check className="h-4 w-4" /> : <Package className="h-4 w-4" />}
            </div>
            <span className="mt-1 text-[10px] text-center sm:text-xs">{s}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border p-4 dark:border-gray-800">
          <h2 className="font-semibold">Items</h2>
          <ul className="mt-3 space-y-3">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>₹{(Number(item.price) * item.quantity).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border p-4 dark:border-gray-800">
          <h2 className="font-semibold">Summary</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>₹{Number(order.subtotal).toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Tax</dt>
              <dd>₹{Number(order.tax).toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd>₹{Number(order.shipping).toLocaleString()}</dd>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-green-600">
                <dt>Discount</dt>
                <dd>-₹{Number(order.discount).toLocaleString()}</dd>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 font-bold">
              <dt>Total</dt>
              <dd>₹{Number(order.total).toLocaleString()}</dd>
            </div>
          </dl>
          <button
            onClick={() =>
              orderApi.invoice(id).then((r) => {
                const inv = r.data.data;
                const win = window.open("", "_blank");
                win.document.write(`
                  <html><body>
                    <h1>Invoice ${inv.invoiceNumber}</h1>
                    <p>Order: ${inv.orderNumber}</p>
                    <p>Date: ${new Date(inv.date).toLocaleString()}</p>
                    <p>Total: ₹${Number(inv.total).toLocaleString()}</p>
                  </body></html>
                `);
              })
            }
            className="mt-4 text-sm text-primary-600 hover:underline"
          >
            Download Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
