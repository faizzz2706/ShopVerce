import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "../api";
import { AuthLayout, Input } from "./Login";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await authApi.forgotPassword(email);
    setSent(true);
    toast.success("If account exists, reset email sent (check server logs in dev)");
  };

  return (
    <AuthLayout title="Forgot Password">
      {sent ? (
        <p className="text-center text-gray-600">
          Check your email for reset instructions. In development, check the server console for the token.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-primary-600 py-3 text-white"
          >
            Send Reset Link
          </button>
        </form>
      )}
      <p className="mt-4 text-center text-sm">
        <Link to="/login" className="text-primary-600 hover:underline">
          Back to Login
        </Link>
      </p>
    </AuthLayout>
  );
}
