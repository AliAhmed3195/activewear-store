"use client";

import type { OrderStatus } from "@prisma/client";
import OrderTrackingTimeline from "@/components/store/OrderTrackingTimeline";
import { buildTrackingView, formatStatusForDisplay } from "@/lib/order-tracking";
import { formatPrice } from "@/lib/utils";

export interface OrderLookupResult {
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: string;
  name: string;
  phone: string | null;
  city: string;
  country: string;
  totalCents: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    productName: string;
    size: string;
    quantity: number;
    priceCents: number;
  }>;
}

export default function OrderTrackingResult({ order }: { order: OrderLookupResult }) {
  const tracking = buildTrackingView(order.status);
  const placedDate = new Date(order.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const updatedDate = new Date(order.updatedAt).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="order-track-result" aria-live="polite">
      <div className="order-track-result-header">
        <div>
          <p className="order-track-result-eyebrow">Order found</p>
          <h2 className="order-track-result-number">{order.orderNumber}</h2>
          <p className="order-track-result-meta">
            Placed {placedDate} · Last update {updatedDate}
          </p>
        </div>
        <div className="order-track-result-pill" data-status={order.status}>
          {formatStatusForDisplay(order.status)}
        </div>
      </div>

      <OrderTrackingTimeline model={tracking} />

      <div className="order-track-summary">
        <div>
          <p className="order-track-summary-label">Ship to</p>
          <p className="order-track-summary-value">
            {order.name}
            <br />
            {order.city}, {order.country}
            {order.phone ? (
              <>
                <br />
                <span className="text-pearl-muted">{order.phone}</span>
              </>
            ) : null}
          </p>
        </div>
        <div>
          <p className="order-track-summary-label">Payment</p>
          <p className="order-track-summary-value">{order.paymentMethod}</p>
        </div>
        <div>
          <p className="order-track-summary-label">Order total</p>
          <p className="order-track-summary-value order-track-summary-total">
            {formatPrice(order.totalCents, order.currency)}
          </p>
        </div>
      </div>

      <div className="order-track-items">
        <p className="order-track-items-title">Items in this order</p>
        <ul>
          {order.items.map((item, i) => (
            <li key={`${item.productName}-${item.size}-${i}`}>
              <span>
                {item.productName}
                <span className="order-track-item-meta">
                  {item.size} × {item.quantity}
                </span>
              </span>
              <span>{formatPrice(item.priceCents * item.quantity, order.currency)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
