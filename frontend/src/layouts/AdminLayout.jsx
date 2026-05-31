import { Link, Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingBag,
  Tag,
  Image,
  Star,
  ArrowLeft,
  Menu,
  X,
} from "lucide-react";
import { toggleAdminSidebar, closeAdminSidebar } from "../store/uiSlice";

const links = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/products", icon: Package, label: "Products" },
  { to: "/admin/orders", icon: ShoppingBag, label: "Orders" },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/reviews", icon: Star, label: "Reviews" },
  { to: "/admin/coupons", icon: Tag, label: "Coupons" },
  { to: "/admin/banners", icon: Image, label: "Banners" },
];

function NavLinks({ onNavigate }) {
  const location = useLocation();

  return (
    <>
      {links.map(({ to, icon: Icon, label, end }) => {
        const active = end
          ? location.pathname === to
          : location.pathname === to || location.pathname.startsWith(`${to}/`);
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
              active
                ? "bg-primary-600 text-white"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </>
  );
}

export default function AdminLayout() {
  const dispatch = useDispatch();
  const { adminSidebarOpen } = useSelector((s) => s.ui);
  const close = () => dispatch(closeAdminSidebar());

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-gray-200 bg-white lg:block xl:w-64 dark:border-gray-800 dark:bg-gray-900">
        <SidebarHeader />
        <nav className="space-y-1 p-3">
          <NavLinks />
        </nav>
      </aside>

      {/* Mobile sidebar */}
      {adminSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={close}
            aria-hidden
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-[min(100%,260px)] flex-col bg-white shadow-xl lg:hidden dark:bg-gray-900">
            <div className="flex items-center justify-between border-b p-4 dark:border-gray-800">
              <span className="font-bold text-primary-600">Admin</span>
              <button
                type="button"
                onClick={close}
                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-3">
              <NavLinks onNavigate={close} />
            </nav>
            <div className="border-t p-3 dark:border-gray-800">
              <Link
                to="/"
                onClick={close}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to store
              </Link>
            </div>
          </aside>
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile admin top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-white px-3 py-3 lg:hidden dark:border-gray-800 dark:bg-gray-900">
          <button
            type="button"
            onClick={() => dispatch(toggleAdminSidebar())}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-semibold">Admin Panel</span>
          <Link to="/" className="ml-auto text-sm text-primary-600">
            Store
          </Link>
        </header>

        <main className="flex-1 overflow-x-hidden p-3 sm:p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarHeader() {
  return (
    <div className="flex items-center justify-between border-b p-4 dark:border-gray-800">
      <span className="font-bold text-primary-600">Admin Panel</span>
      <Link to="/" className="text-gray-500 hover:text-primary-600" title="Back to store">
        <ArrowLeft className="h-4 w-4" />
      </Link>
    </div>
  );
}
