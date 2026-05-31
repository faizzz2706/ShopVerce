import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { loginUser, clearError } from "../store/authSlice";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    try {
      await dispatch(loginUser(form)).unwrap();
      toast.success("Welcome back!");
      const from = location.state?.from?.pathname;
      navigate(from && from !== "/login" ? from : "/");
    } catch (err) {
      toast.error(err || "Invalid email or password");
    }
  };

  return (
    <AuthLayout title="Login to ShopVerse">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="text-right">
          <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-primary-600 py-3 font-medium text-white hover:bg-primary-700"
        >
          Login
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="text-primary-600 hover:underline">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}

export function AuthLayout({ title, children }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-3 py-6 sm:min-h-[80vh] sm:px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-5 shadow-lg sm:p-8 dark:border-gray-800 dark:bg-gray-900">
        <h1 className="text-center text-xl font-bold sm:text-2xl">{title}</h1>
        <div className="mt-4 sm:mt-6">{children}</div>
      </div>
    </div>
  );
}

export function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <input
        {...props}
        className="mt-1 w-full rounded-lg border px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
      />
    </div>
  );
}
