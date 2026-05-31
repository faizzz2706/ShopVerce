import { useEffect, useState } from "react";
import { adminApi } from "../../api";
import toast from "react-hot-toast";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({
    code: "",
    type: "PERCENTAGE",
    value: 10,
    minPurchase: 500,
    maxUses: 100,
    active: true,
  });

  const load = () => adminApi.coupons().then((r) => setCoupons(r.data.data));

  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    await adminApi.createCoupon(form);
    toast.success("Coupon created");
    load();
    setForm({ ...form, code: "" });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Coupons</h1>
      <form onSubmit={create} className="mt-6 flex flex-wrap gap-3 rounded-xl border p-4 dark:border-gray-800">
        <input
          placeholder="CODE"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
          className="rounded border px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
          required
        />
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="rounded border px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
        >
          <option value="PERCENTAGE">Percentage</option>
          <option value="FIXED">Fixed</option>
        </select>
        <input
          type="number"
          placeholder="Value"
          value={form.value}
          onChange={(e) => setForm({ ...form, value: +e.target.value })}
          className="w-24 rounded border px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
        />
        <button type="submit" className="rounded-lg bg-primary-600 px-4 py-2 text-white">
          Create
        </button>
      </form>
      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="pb-2">Code</th>
            <th>Type</th>
            <th>Value</th>
            <th>Used</th>
            <th>Active</th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((c) => (
            <tr key={c.id} className="border-b dark:border-gray-800">
              <td className="py-2 font-mono">{c.code}</td>
              <td>{c.type}</td>
              <td>{c.type === "PERCENTAGE" ? `${c.value}%` : `₹${c.value}`}</td>
              <td>
                {c.usedCount}/{c.maxUses || "∞"}
              </td>
              <td>{c.active ? "✓" : "✗"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
