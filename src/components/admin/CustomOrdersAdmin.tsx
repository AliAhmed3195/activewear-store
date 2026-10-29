"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type CustomOrderRow = {
  id: string;
  reference: string;
  name: string;
  email: string;
  phone: string;
  organization: string | null;
  productType: string;
  quantity: number;
  sizeBreakdown: string | null;
  fabricId: string | null;
  printNames: boolean;
  printNumbers: boolean;
  printLogo: boolean;
  placement: string | null;
  colorPreference: string | null;
  deadline: string | null;
  notes: string | null;
  status: string;
  quotedPricePkr: number | null;
  adminNotes: string | null;
  createdAt: string | Date;
};

const STATUSES = [
  "NEW",
  "QUOTED",
  "CONFIRMED",
  "IN_PRODUCTION",
  "SHIPPED",
  "DONE",
  "CANCELLED",
] as const;

export default function CustomOrdersAdmin({
  initial,
  fabricMap,
}: {
  initial: CustomOrderRow[];
  fabricMap: Record<string, string>;
}) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [filter, setFilter] = useState("ALL");
  const [busyId, setBusyId] = useState<string | null>(null);

  const visible = useMemo(
    () => (filter === "ALL" ? rows : rows.filter((r) => r.status === filter)),
    [rows, filter]
  );

  const update = async (
    id: string,
    patch: { status?: string; quotedPricePkr?: number | null; adminNotes?: string | null }
  ) => {
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/custom-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
      if (!res.ok) return;
      const updated = await res.json();
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
      router.refresh();
    } finally {
      setBusyId(null);
    }
  };

  if (rows.length === 0) {
    return (
      <div className="luxury-card p-6">
        <p className="font-ui text-pearl-muted">No custom quote requests yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="dash-table-filters">
        <select
          className="dash-filter-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="ALL">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <p className="dash-filter-meta">{visible.length} request(s)</p>
      </div>

      <div className="space-y-3">
        {visible.map((o) => (
          <article key={o.id} className="luxury-card p-4 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-pearl tracking-wide">{o.reference}</p>
                <p className="font-ui text-sm text-pearl-muted mt-1">
                  {o.name}
                  {o.organization ? ` · ${o.organization}` : ""} · {o.email} · {o.phone}
                </p>
              </div>
              <span className="status-badge is-pending">{o.status}</span>
            </div>

            <div className="font-ui text-sm text-pearl-muted grid gap-1 md:grid-cols-2">
              <p>
                <strong className="text-pearl">Product:</strong> {o.productType} × {o.quantity}
              </p>
              <p>
                <strong className="text-pearl">Fabric:</strong>{" "}
                {o.fabricId ? fabricMap[o.fabricId] ?? o.fabricId : "—"}
              </p>
              <p>
                <strong className="text-pearl">Sizes:</strong> {o.sizeBreakdown || "—"}
              </p>
              <p>
                <strong className="text-pearl">Print:</strong>{" "}
                {[
                  o.printNames && "Names",
                  o.printNumbers && "Numbers",
                  o.printLogo && "Logo",
                ]
                  .filter(Boolean)
                  .join(", ") || "None"}
                {o.placement ? ` · ${o.placement}` : ""}
              </p>
              <p>
                <strong className="text-pearl">Color:</strong> {o.colorPreference || "—"}
              </p>
              <p>
                <strong className="text-pearl">Deadline:</strong> {o.deadline || "—"}
              </p>
            </div>

            {o.notes && (
              <p className="font-ui text-sm text-pearl">
                <strong>Notes:</strong> {o.notes}
              </p>
            )}

            <div className="flex flex-wrap gap-2 items-end">
              <label className="font-ui text-xs">
                Status
                <select
                  className="dash-filter-select mt-1 block"
                  disabled={busyId === o.id}
                  value={o.status}
                  onChange={(e) => update(o.id, { status: e.target.value })}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="font-ui text-xs">
                Quote PKR
                <input
                  type="number"
                  className="dash-filter-input mt-1 block"
                  defaultValue={o.quotedPricePkr ?? ""}
                  placeholder="0"
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    update(o.id, {
                      quotedPricePkr: v === "" ? null : Math.max(0, Math.round(Number(v))),
                    });
                  }}
                />
              </label>
              <label className="font-ui text-xs flex-1 min-w-[12rem]">
                Admin notes
                <input
                  className="dash-filter-input mt-1 block w-full"
                  defaultValue={o.adminNotes ?? ""}
                  onBlur={(e) => update(o.id, { adminNotes: e.target.value || null })}
                />
              </label>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
