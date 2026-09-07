"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { storeName } from "@/lib/utils";

export default function AdminLoginForm() {
  const router = useRouter();
  const name = storeName();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <p className="admin-login-kicker">{name} Admin</p>
        <h1 className="font-display text-2xl text-pearl mt-2">Sign in</h1>
        <p className="font-ui text-sm text-pearl-muted mt-2">
          Manage products, orders, inventory, and customers.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="admin-label">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="admin-input"
              required
              autoComplete="email"
              placeholder="admin@peakactivewear.com"
            />
          </label>
          <label className="block">
            <span className="admin-label">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-input"
              required
              autoComplete="current-password"
            />
          </label>
          {error && <p className="font-ui text-xs text-red-400">{error}</p>}
          <button type="submit" className="btn-copper w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
