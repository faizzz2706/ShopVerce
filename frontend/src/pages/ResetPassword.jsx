import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "../api";
import { AuthLayout, Input } from "./Login";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const token = searchParams.get("token") || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    await authApi.resetPassword({ token, password });
    toast.success("Password reset successful");
    navigate("/login");
  };

  return (
    <AuthLayout title="Reset Password">
      <form onSubmit={handleSubmit} className="space-y-4">
        {!token && (
          <Input
            label="Reset Token"
            value={token}
            onChange={() => {}}
            placeholder="Paste token from email"
            required
          />
        )}
        <Input
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="w-full rounded-lg bg-primary-600 py-3 text-white">
          Reset Password
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        <Link to="/login" className="text-primary-600 hover:underline">
          Back to Login
        </Link>
      </p>
    </AuthLayout>
  );
}
