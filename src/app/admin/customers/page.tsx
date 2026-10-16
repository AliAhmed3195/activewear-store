"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { adminFetchJson } from "@/lib/admin-fetch";
import { formatPrice } from "@/lib/utils";

interface Customer {
  email: string;
  name: string;
  phone: string | null;
  city: string;
  country: string;
  orderCount: number;
  totalSpentCents: number;
  lastOrderAt: string;
  lastOrderNumber: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    adminFetchJson<Customer[]>("/api/admin/customers")
      .then(setCustomers)
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Failed to load customers"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        (c.phone ?? "").includes(query) ||
        c.city.toLowerCase().includes(query)
    );
  }, [customers, q]);

  return (
    <AdminShell>
      <h1 className="font-display text-2xl text-pearl">Customers</h1>
      <p className="font-ui text-sm text-pearl-muted mt-1">
        Built from checkout orders — {customers.length} unique buyers
      </p>

      {loadError && (
        <p className="admin-brand-error font-ui mt-3" role="alert">
          {loadError}
        </p>
      )}

      <input
        className="admin-input mt-6 max-w-md"
        placeholder="Search name, email, phone, city…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="luxury-card mt-6 overflow-x-auto">
        {loading ? (
          <p className="p-8 text-pearl-muted font-ui text-sm">Loading…</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Location</th>
                <th>Orders</th>
                <th>Spent</th>
                <th>Last order</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.email}>
                  <td>
                    <span className="font-display">{c.name}</span>
                    <span className="block text-xs text-pearl-muted">{c.email}</span>
                    {c.phone && <span className="block text-xs text-pearl-muted">{c.phone}</span>}
                  </td>
                  <td>
                    {c.city}, {c.country}
                  </td>
                  <td>{c.orderCount}</td>
                  <td className="text-copper">{formatPrice(c.totalSpentCents)}</td>
                  <td>
                    <span>{c.lastOrderNumber}</span>
                    <span className="block text-xs text-pearl-muted">
                      {new Date(c.lastOrderAt).toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-pearl-muted py-8">
                    No customers yet — orders will appear here after checkout
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <p className="mt-4">
        <Link href="/admin/orders" className="font-ui text-xs text-blush tracking-widest capitalize">
          View all orders →
        </Link>
      </p>
    </AdminShell>
  );
}
