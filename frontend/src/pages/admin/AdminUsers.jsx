import { useEffect, useState } from "react";
import { adminApi } from "../../api";
import toast from "react-hot-toast";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    adminApi.users({ limit: 50 }).then((r) => setUsers(r.data.data));
  }, []);

  const changeRole = async (id, role) => {
    await adminApi.updateUserRole(id, role);
    toast.success("Role updated");
    adminApi.users({ limit: 50 }).then((r) => setUsers(r.data.data));
  };

  return (
    <div>
      <h1 className="text-xl font-bold sm:text-2xl">Users</h1>
      <div className="mt-4 overflow-x-auto sm:mt-6">
      <table className="w-full min-w-[520px] text-sm rounded-xl border overflow-hidden dark:border-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="p-3 text-left">Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Orders</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t dark:border-gray-800">
              <td className="p-3">
                {u.firstName} {u.lastName}
              </td>
              <td>{u.email}</td>
              <td>
                <select
                  value={u.role}
                  onChange={(e) => changeRole(u.id, e.target.value)}
                  className="rounded border px-2 py-1 dark:border-gray-700 dark:bg-gray-800"
                >
                  <option value="CUSTOMER">CUSTOMER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </td>
              <td className="text-center">{u._count?.orders}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
