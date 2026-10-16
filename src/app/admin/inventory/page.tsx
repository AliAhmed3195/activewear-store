"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import SizeStockManager from "@/components/admin/SizeStockManager";
import { adminFetchJson } from "@/lib/admin-fetch";
import { formatPrice } from "@/lib/utils";
import { totalFromSizeStock, type SizeStockMap } from "@/lib/size-stock";

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

interface InvRow {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  colorName: string;
  stock: number;
  sizes: string[];
  sizeStock: SizeStockMap;
  status: string;
  priceCentsPkr: number;
  category: { name: string } | null;
  imageUrl: string | null;
}

type Draft = { sizes: string[]; sizeStock: SizeStockMap };

export default function AdminInventoryPage() {
  const [rows, setRows] = useState<InvRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [onlyLow, setOnlyLow] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setLoadError(null);
    adminFetchJson<InvRow[]>("/api/admin/inventory")
      .then((data) => {
        setRows(data);
        const map: Record<string, Draft> = {};
        data.forEach((row) => {
          map[row.id] = { sizes: [...row.sizes], sizeStock: { ...row.sizeStock } };
        });
        setDrafts(map);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Failed to load inventory"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rows.filter((row) => {
      if (onlyLow && row.stock > 5) return false;
      if (!query) return true;
      return (
        row.productName.toLowerCase().includes(query) ||
        row.productSlug.toLowerCase().includes(query) ||
        row.colorName.toLowerCase().includes(query) ||
        (row.category?.name ?? "").toLowerCase().includes(query)
      );
    });
  }, [rows, q, onlyLow]);

  const toggleSize = (id: string, size: string) => {
    setDrafts((prev) => {
      const cur = prev[id] ?? { sizes: [], sizeStock: {} };
      const on = cur.sizes.includes(size);
      return {
        ...prev,
        [id]: {
          sizes: on ? cur.sizes.filter((s) => s !== size) : [...cur.sizes, size],
          sizeStock: { ...cur.sizeStock, [size]: on ? 0 : cur.sizeStock[size] ?? 0 },
        },
      };
    });
  };

  const setQty = (id: string, size: string, qty: number) => {
    const next = Math.max(0, Math.floor(qty) || 0);
    setDrafts((prev) => {
      const cur = prev[id] ?? { sizes: [], sizeStock: {} };
      const sizes = next > 0 && !cur.sizes.includes(size) ? [...cur.sizes, size] : cur.sizes;
      return {
        ...prev,
        [id]: { sizes, sizeStock: { ...cur.sizeStock, [size]: next } },
      };
    });
  };

  const isDirty = (row: InvRow, draft: Draft) => {
    if (draft.sizes.length !== row.sizes.length) return true;
    if (draft.sizes.some((s) => !row.sizes.includes(s))) return true;
    return ALL_SIZES.some((s) => (draft.sizeStock[s] ?? 0) !== (row.sizeStock[s] ?? 0));
  };

  const save = async (row: InvRow) => {
    const draft = drafts[row.id] ?? { sizes: row.sizes, sizeStock: row.sizeStock };
    const sizes = draft.sizes.length
      ? draft.sizes
      : ALL_SIZES.filter((s) => (draft.sizeStock[s] ?? 0) > 0);
    setSavingId(row.id);
    let data: { stock: number; sizeStock: SizeStockMap; sizes: string[] };
    try {
      data = await adminFetchJson("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: row.id,
          sizeStock: draft.sizeStock,
          sizes: sizes.length ? sizes : ["S", "M", "L"],
        }),
      });
    } catch {
      alert("Failed to update stock");
      setSavingId(null);
      return;
    }
    setSavingId(null);
    setRows((prev) =>
      prev.map((r) =>
        r.id === row.id
          ? { ...r, stock: data.stock, sizeStock: data.sizeStock, sizes: data.sizes }
          : r
      )
    );
    setDrafts((prev) => ({
      ...prev,
      [row.id]: { sizes: data.sizes, sizeStock: data.sizeStock },
    }));
  };

  return (
    <AdminShell>
      <h1 className="font-display text-2xl text-pearl">Inventory</h1>
      <p className="font-ui text-sm text-pearl-muted mt-1">
        Per-color variant stock — toggle sizes and save
      </p>

      {loadError && (
        <p className="admin-brand-error font-ui mt-3" role="alert">
          {loadError}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <input
          className="admin-input flex-1"
          placeholder="Search products or colors…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <label className="flex items-center gap-2 font-ui text-sm text-pearl cursor-pointer whitespace-nowrap">
          <input type="checkbox" checked={onlyLow} onChange={(e) => setOnlyLow(e.target.checked)} />
          Low stock only
        </label>
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="p-8 text-pearl-muted font-ui text-sm luxury-card">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-pearl-muted luxury-card">No variants match</p>
        ) : (
          filtered.map((row) => {
            const draft = drafts[row.id] ?? { sizes: row.sizes, sizeStock: row.sizeStock };
            const total = totalFromSizeStock(
              Object.fromEntries(draft.sizes.map((s) => [s, draft.sizeStock[s] ?? 0]))
            );
            const dirty = isDirty(row, draft);
            return (
              <article key={row.id} className="luxury-card p-4 sm:p-5">
                <div className="flex flex-wrap items-start gap-4 mb-4">
                  <div className="w-12 h-14 bg-surface border border-[var(--divider)] overflow-hidden flex-shrink-0">
                    {row.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={row.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-display text-lg text-pearl leading-tight">{row.productName}</h2>
                    <p className="font-ui text-xs text-pearl-muted mt-1">
                      {row.colorName} · {formatPrice(row.priceCentsPkr, "pkr")} ·{" "}
                      {row.category?.name ?? "—"} · {row.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-auto">
                    <div className="text-right">
                      <p className="font-ui text-[10px] tracking-[0.16em] capitalize text-pearl-muted">
                        Total
                      </p>
                      <p className={`font-display text-xl ${total <= 5 ? "text-copper" : "text-pearl"}`}>
                        {total}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn-copper text-[10px] py-2 px-3"
                      disabled={savingId === row.id || !dirty}
                      onClick={() => save(row)}
                    >
                      {savingId === row.id ? "Saving…" : "Save"}
                    </button>
                    <Link
                      href={`/admin/products/${row.productId}/edit`}
                      className="font-ui text-xs text-pearl-muted hover:text-blush"
                    >
                      Edit
                    </Link>
                  </div>
                </div>

                <SizeStockManager
                  sizes={draft.sizes}
                  sizeStock={draft.sizeStock}
                  showHeader={false}
                  onToggle={(s) => toggleSize(row.id, s)}
                  onQty={(s, qty) => setQty(row.id, s, qty)}
                  onApply={(next) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [row.id]: { sizes: next.sizes, sizeStock: next.sizeStock },
                    }))
                  }
                />
              </article>
            );
          })
        )}
      </div>
    </AdminShell>
  );
}
