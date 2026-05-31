import { useEffect, useState } from "react";
import { adminApi } from "../../api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Users, Package, ShoppingBag, DollarSign } from "lucide-react";

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    adminApi.dashboard().then((r) => setData(r.data.data));
  }, []);

  if (!data) return <div>Loading dashboard...</div>;

  const { stats, recentOrders, ordersByStatus, lowStock } = data;

  const statCards = [
    { label: "Users", value: stats.totalUsers, icon: Users, color: "bg-blue-500" },
    { label: "Products", value: stats.totalProducts, icon: Package, color: "bg-green-500" },
    { label: "Orders", value: stats.totalOrders, icon: ShoppingBag, color: "bg-purple-500" },
    {
      label: "Revenue",
      value: `₹${Number(stats.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "bg-primary-500",
    },
  ];

  const chartData = ordersByStatus?.map((s) => ({
    name: s.status,
    count: s._count.status,
  })) || [];

  return (
    <div>
      <h1 className="text-xl font-bold sm:text-2xl">Dashboard</h1>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="flex flex-col gap-3 rounded-xl border bg-white p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5 dark:border-gray-800 dark:bg-gray-900"
          >
            <div className={`rounded-lg ${color} p-3 text-white`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-lg font-bold sm:text-2xl">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="font-semibold">Orders by Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="font-semibold">Low Stock Alert</h2>
          <ul className="mt-4 space-y-2">
            {lowStock?.map((p) => (
              <li key={p.id} className="flex justify-between text-sm">
                <span>{p.name}</span>
                <span className="font-medium text-red-600">{p.stock} left</span>
              </li>
            ))}
            {(!lowStock || lowStock.length === 0) && (
              <p className="text-sm text-gray-500">All products well stocked</p>
            )}
          </ul>
        </div>
      </div>

      <div className="mt-8 rounded-xl border bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="font-semibold">Recent Orders</h2>
        <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-2">Order</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders?.map((o) => (
              <tr key={o.id} className="border-b dark:border-gray-800">
                <td className="py-2">{o.orderNumber}</td>
                <td>{o.user?.email}</td>
                <td>₹{Number(o.total).toLocaleString()}</td>
                <td>{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
