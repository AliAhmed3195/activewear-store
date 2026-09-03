"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { formatPrice } from "@/lib/utils";

interface OrderItem {
  id: string;
  productName: string;
  productSlug: string;
  priceCents: number;
  size: string;
  quantity: number;
}

interface OrderRow {
  id: string;
  orderNumber: string;
  name: string;
  email: string;
  phone: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string | null;
  postalCode: string;
  country: string;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  status: string;
  paymentMethod: string;
  clientIp: string | null;
  geoCountry: string | null;
  geoRegion: string | null;
  geoCity: string | null;
  userAgent: string | null;
  createdAt: string;
  items: OrderItem[];
}

const STATUSES = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

function originLabel(order: OrderRow): string {
  const parts = [order.geoCity, order.geoRegion, order.geoCountry].filter(Boolean);
  if (parts.length) return parts.join(", ");
  if (order.clientIp) return `IP ${order.clientIp}`;
  return "—";
}

function shipLabel(order: OrderRow): string {
  return [order.city, order.state, order.country].filter(Boolean).join(", ");
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");
  const [pay, setPay] = useState("ALL");

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return orders.filter((o) => {
      if (status !== "ALL" && o.status !== status) return false;
      if (pay !== "ALL" && o.paymentMethod !== pay) return false;
      if (!query) return true;
      return (
        o.orderNumber.toLowerCase().includes(query) ||
        o.name.toLowerCase().includes(query) ||
        o.email.toLowerCase().includes(query) ||
        (o.phone ?? "").includes(query) ||
        o.city.toLowerCase().includes(query)
      );
    });
  }, [orders, q, status, pay]);

  const updateStatus = async (id: string, next: string) => {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: next } : o)));
  };

  const toggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <AdminShell>
      <h1 className="font-display text-2xl text-pearl">Orders</h1>
      <p className="font-ui text-sm text-pearl-muted mt-1">
        {orders.length} total · {filtered.length} shown — click a row for full details
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <input
          className="admin-input flex-1"
          placeholder="Search order #, name, email, phone, city…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="admin-input sm:w-44" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="ALL">All status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select className="admin-input sm:w-36" value={pay} onChange={(e) => setPay(e.target.value)}>
          <option value="ALL">All pay</option>
          <option value="COD">COD</option>
          <option value="CARD">CARD</option>
        </select>
      </div>

      <div className="luxury-card mt-6 overflow-x-auto">
        {loading ? (
          <p className="p-8 text-pearl-muted font-ui text-sm">Loading…</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>Order</th>
                <th>Customer</th>
                <th>Pay</th>
                <th>Ship to</th>
                <th>Order from</th>
                <th>Total</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const open = expandedId === order.id;
                return (
                  <Fragment key={order.id}>
                    <tr className="admin-order-row" onClick={() => toggle(order.id)}>
                      <td className="admin-order-expand">{open ? "−" : "+"}</td>
                      <td>{order.orderNumber}</td>
                      <td>
                        <span>{order.name}</span>
                        <span className="block text-xs text-pearl-muted">{order.email}</span>
                        {order.phone && (
                          <span className="block text-xs text-pearl-muted">{order.phone}</span>
                        )}
                      </td>
                      <td>{order.paymentMethod}</td>
                      <td>
                        <span>{shipLabel(order)}</span>
                        <span className="block text-xs text-pearl-muted">{order.postalCode}</span>
                      </td>
                      <td>
                        <span>{originLabel(order)}</span>
                        {order.clientIp && (
                          <span className="block text-xs text-pearl-muted">{order.clientIp}</span>
                        )}
                      </td>
                      <td className="text-copper">{formatPrice(order.totalCents)}</td>
                      <td className="text-pearl-muted">
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <select
                          className="admin-input py-1 text-xs"
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                    {open && (
                      <tr className="admin-order-detail-row">
                        <td colSpan={9}>
                          <div className="admin-order-detail">
                            <div className="admin-order-detail-grid">
                              <section>
                                <h3>Shipping address</h3>
                                <p>{order.name}</p>
                                {order.phone && <p>{order.phone}</p>}
                                <p>{order.addressLine1}</p>
                                {order.addressLine2 && <p>{order.addressLine2}</p>}
                                <p>
                                  {[order.city, order.state, order.postalCode]
                                    .filter(Boolean)
                                    .join(", ")}
                                </p>
                                <p>{order.country}</p>
                              </section>

                              <section>
                                <h3>Order origin (tracker)</h3>
                                <p>
                                  <span className="admin-order-k">Location</span>
                                  {originLabel(order)}
                                </p>
                                <p>
                                  <span className="admin-order-k">IP</span>
                                  {order.clientIp || "—"}
                                </p>
                                <p>
                                  <span className="admin-order-k">Country</span>
                                  {order.geoCountry || "—"}
                                </p>
                                <p>
                                  <span className="admin-order-k">Region</span>
                                  {order.geoRegion || "—"}
                                </p>
                                <p>
                                  <span className="admin-order-k">City</span>
                                  {order.geoCity || "—"}
                                </p>
                                {order.userAgent && (
                                  <p className="admin-order-ua">
                                    <span className="admin-order-k">Device</span>
                                    {order.userAgent}
                                  </p>
                                )}
                              </section>

                              <section>
                                <h3>Payment</h3>
                                <p>
                                  <span className="admin-order-k">Method</span>
                                  {order.paymentMethod}
                                </p>
                                <p>
                                  <span className="admin-order-k">Subtotal</span>
                                  {formatPrice(order.subtotalCents)}
                                </p>
                                <p>
                                  <span className="admin-order-k">Shipping</span>
                                  {formatPrice(order.shippingCents)}
                                </p>
                                <p>
                                  <span className="admin-order-k">Total</span>
                                  {formatPrice(order.totalCents)}
                                </p>
                              </section>
                            </div>

                            <section className="admin-order-items">
                              <h3>Items</h3>
                              <ul>
                                {order.items.map((item) => (
                                  <li key={item.id}>
                                    <span>
                                      {item.productName}{" "}
                                      <span className="text-pearl-muted">
                                        · {item.size} · ×{item.quantity}
                                      </span>
                                    </span>
                                    <span className="text-copper">
                                      {formatPrice(item.priceCents * item.quantity)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </section>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center text-pearl-muted py-8">
                    No orders match
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </AdminShell>
  );
}
