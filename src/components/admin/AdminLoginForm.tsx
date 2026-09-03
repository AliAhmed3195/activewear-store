"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@elvenenoir.com");
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
        setError("Invalid email or password. Check SEED_ADMIN_* in .env.local");
        setLoading(false);
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Login failed — is the server running?");
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="luxury-card p-8 w-full max-w-md">
        <span className="badge-micro">Elvene Noir Admin</span>
        <h1 className="font-display text-2xl text-pearl mt-2">Sign In</h1>
        <p className="font-ui text-xs text-pearl-muted mt-2">
          Use <code>SEED_ADMIN_EMAIL</code> / <code>SEED_ADMIN_PASSWORD</code> from{" "}
          <code>.env.local</code>.
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
