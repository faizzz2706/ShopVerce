import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { userApi } from "../api";
import { fetchMe } from "../store/authSlice";
import { Input } from "./Login";

export default function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [tab, setTab] = useState("profile");
  const [dashboard, setDashboard] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [profile, setProfile] = useState({ firstName: "", lastName: "", phone: "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [newAddress, setNewAddress] = useState({
    label: "Home",
    street: "",
    city: "",
    state: "",
    zip: "",
    isDefault: true,
  });

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || "",
      });
    }
    userApi.dashboard().then((r) => setDashboard(r.data.data));
    userApi.addresses().then((r) => setAddresses(r.data.data));
    userApi.notifications().then((r) => setNotifications(r.data.data));
  }, [user]);

  const saveProfile = async (e) => {
    e.preventDefault();
    await userApi.updateProfile(profile);
    dispatch(fetchMe());
    toast.success("Profile updated");
  };

  const changePassword = async (e) => {
    e.preventDefault();
    await userApi.changePassword(passwords);
    toast.success("Password changed");
    setPasswords({ currentPassword: "", newPassword: "" });
  };

  const addAddress = async (e) => {
    e.preventDefault();
    await userApi.createAddress({ ...newAddress, type: "SHIPPING" });
    const { data } = await userApi.addresses();
    setAddresses(data.data);
    toast.success("Address added");
  };

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "password", label: "Password" },
    { id: "addresses", label: "Addresses" },
    { id: "notifications", label: "Notifications" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-3 py-4 sm:px-4 sm:py-6">
      <h1 className="text-xl font-bold sm:text-2xl">My Account</h1>

      {dashboard && (
        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-4">
          {[
            { label: "Orders", value: dashboard.orderCount },
            { label: "Wishlist", value: dashboard.wishlistCount },
            { label: "Unread", value: dashboard.unreadNotifications },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border bg-white p-4 text-center dark:border-gray-800 dark:bg-gray-900"
            >
              <p className="text-2xl font-bold text-primary-600">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="-mx-3 mt-4 flex gap-1 overflow-x-auto border-b px-3 sm:mx-0 sm:mt-6 sm:gap-2 sm:px-0">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 px-3 py-2 text-sm font-medium sm:px-4 ${
              tab === t.id
                ? "border-b-2 border-primary-600 text-primary-600"
                : "text-gray-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-xl border bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        {tab === "profile" && (
          <form onSubmit={saveProfile} className="max-w-md space-y-4">
            <Input
              label="First Name"
              value={profile.firstName}
              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
            />
            <Input
              label="Last Name"
              value={profile.lastName}
              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
            />
            <Input
              label="Phone"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
            <p className="text-sm text-gray-500">Email: {user?.email}</p>
            {!user?.emailVerified && (
              <p className="text-sm text-amber-600">
                Email not verified. Check your inbox or contact support.
              </p>
            )}
            <button type="submit" className="rounded-lg bg-primary-600 px-6 py-2 text-white">
              Save Changes
            </button>
          </form>
        )}

        {tab === "password" && (
          <form onSubmit={changePassword} className="max-w-md space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={passwords.currentPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, currentPassword: e.target.value })
              }
            />
            <Input
              label="New Password"
              type="password"
              value={passwords.newPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, newPassword: e.target.value })
              }
            />
            <button type="submit" className="rounded-lg bg-primary-600 px-6 py-2 text-white">
              Change Password
            </button>
          </form>
        )}

        {tab === "addresses" && (
          <div className="space-y-6">
            {addresses.map((addr) => (
              <div key={addr.id} className="rounded-lg border p-4 dark:border-gray-700">
                <p className="font-medium">{addr.label}</p>
                <p className="text-sm text-gray-600">
                  {addr.street}, {addr.city}, {addr.state} {addr.zip}
                </p>
                {addr.isDefault && (
                  <span className="text-xs text-primary-600">Default</span>
                )}
              </div>
            ))}
            <form onSubmit={addAddress} className="space-y-3 border-t pt-4">
              <h3 className="font-medium">Add New Address</h3>
              <Input
                label="Street"
                value={newAddress.street}
                onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="City"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  required
                />
                <Input
                  label="State"
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                  required
                />
              </div>
              <Input
                label="ZIP"
                value={newAddress.zip}
                onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
                required
              />
              <button type="submit" className="rounded-lg bg-primary-600 px-4 py-2 text-white text-sm">
                Add Address
              </button>
            </form>
          </div>
        )}

        {tab === "notifications" && (
          <div className="space-y-3">
            <button
              onClick={() => userApi.markAllRead().then(() => userApi.notifications().then((r) => setNotifications(r.data.data)))}
              className="text-sm text-primary-600 hover:underline"
            >
              Mark all as read
            </button>
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`rounded-lg border p-3 ${!n.read ? "bg-primary-50 dark:bg-primary-900/10" : ""}`}
              >
                <p className="font-medium">{n.title}</p>
                <p className="text-sm text-gray-600">{n.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
