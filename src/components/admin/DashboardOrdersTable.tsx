"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/admin/StatusBadge";
import { formatPrice } from "@/lib/utils";

type Row = {
  id: string;
  orderNumber: string;
  name: string;
  paymentMethod: string;
  totalCents: number;
  currency: string;
  status: string;
};

export default function DashboardOrdersTable({ orders }: { orders: Row[] }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return orders.filter((o) => {
      if (status !== "ALL" && o.status !== status) return false;
      if (!needle) return true;
      return (
        o.orderNumber.toLowerCase().includes(needle) ||
        o.name.toLowerCase().includes(needle) ||
        o.paymentMethod.toLowerCase().includes(needle)
      );
    });
  }, [orders, q, status]);

  return (
    <div>
      <div className="dash-table-filters">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search order or customer…"
          className="admin-input dash-filter-input"
          aria-label="Search orders"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="admin-input dash-filter-select"
          aria-label="Filter by status"
        >
          <option value="ALL">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>
      <div className="dash-table-wrap">
        <table className="admin-table dash-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr key={order.id}>
                <td className="font-medium">{order.orderNumber}</td>
                <td>
                  <span className="block truncate max-w-[10rem]">{order.name}</span>
                  <span className="block text-[11px] text-pearl-muted">
                    {order.paymentMethod}
                  </span>
                </td>
                <td className="text-copper whitespace-nowrap">
                  {formatPrice(order.totalCents, order.currency)}
                </td>
                <td>
                  <StatusBadge status={order.status} />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-pearl-muted py-8">
                  No matching orders
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="dash-filter-meta">
        Showing {filtered.length} of {orders.length} ·{" "}
        <Link href="/admin/orders">Open full orders</Link>
      </p>
    </div>
  );
}
