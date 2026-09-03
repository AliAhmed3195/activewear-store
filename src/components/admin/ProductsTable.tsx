"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/utils";

export type AdminProductRow = {
  id: string;
  name: string;
  slug: string;
  priceCentsPkr: number;
  stock: number;
  variantCount: number;
  status: string;
  featured: boolean;
  thumbUrl: string | null;
  category: { name: string } | null;
};

export default function ProductsTable({ products: initial }: { products: AdminProductRow[] }) {
  const [products, setProducts] = useState(initial);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return products.filter((p) => {
      if (status !== "ALL" && p.status !== status) return false;
      if (!query) return true;
      return (
        p.name.toLowerCase().includes(query) ||
        p.slug.toLowerCase().includes(query) ||
        (p.category?.name ?? "").toLowerCase().includes(query)
      );
    });
  }, [products, q, status]);

  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setBusyId(id);
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setBusyId(null);
    if (!res.ok) {
      alert("Failed to delete product");
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="mt-8 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          className="admin-input flex-1"
          placeholder="Search name, slug, category…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="admin-input sm:w-40" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="ALL">All status</option>
          <option value="ACTIVE">Active</option>
          <option value="DRAFT">Draft</option>
        </select>
      </div>

      <div className="luxury-card overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Category</th>
              <th>Price (PKR)</th>
              <th>Variants</th>
              <th>Stock</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="w-10 h-12 bg-surface border border-[var(--divider)] overflow-hidden">
                    {p.thumbUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.thumbUrl} alt="" className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                </td>
                <td>
                  <span className="font-display">{p.name}</span>
                  <span className="block font-ui text-xs text-pearl-muted">{p.slug}</span>
                </td>
                <td className="text-pearl-muted">{p.category?.name ?? "—"}</td>
                <td>{formatPrice(p.priceCentsPkr, "pkr")}</td>
                <td>{p.variantCount}</td>
                <td className={p.stock <= 5 ? "text-copper" : undefined}>{p.stock}</td>
                <td>{p.status}</td>
                <td className="whitespace-nowrap">
                  <Link href={`/admin/products/${p.id}/edit`} className="font-ui text-xs text-blush mr-3">
                    Edit
                  </Link>
                  <Link href={`/product/${p.slug}`} className="font-ui text-xs text-pearl-muted mr-3" target="_blank">
                    View
                  </Link>
                  <button
                    type="button"
                    className="font-ui text-xs text-red-400"
                    disabled={busyId === p.id}
                    onClick={() => remove(p.id, p.name)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center text-pearl-muted py-8">No products match</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="font-ui text-xs text-pearl-muted">{filtered.length} shown</p>
    </div>
  );
}
