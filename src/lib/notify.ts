import type { Order, OrderItem } from "@prisma/client";

type OrderWithItems = Order & { items: OrderItem[] };

function adminWhatsAppNumber(): string | null {
  const raw = process.env.ORDER_NOTIFY_WHATSAPP ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 10 ? digits : null;
}

export function buildWhatsAppOrderMessage(order: OrderWithItems): string {
  const lines = [
    `New Elvene Noir order ${order.orderNumber}`,
    `Payment: ${order.paymentMethod}`,
    `Customer: ${order.name}`,
    `Phone: ${order.phone ?? "—"}`,
    `Email: ${order.email}`,
    `Ship to: ${order.addressLine1}, ${order.city}, ${order.postalCode}, ${order.country}`,
    `Total: $${(order.totalCents / 100).toFixed(2)} ${order.currency.toUpperCase()}`,
    "",
    "Items:",
    ...order.items.map(
      (i) => `- ${i.productName} (${i.size}) × ${i.quantity}`
    ),
  ];
  return lines.join("\n");
}

export function whatsAppNotifyUrl(order: OrderWithItems): string | null {
  const phone = adminWhatsAppNumber();
  if (!phone) return null;
  return `https://wa.me/${phone}?text=${encodeURIComponent(buildWhatsAppOrderMessage(order))}`;
}

export async function notifyOrderPlaced(order: OrderWithItems): Promise<void> {
  const wa = whatsAppNotifyUrl(order);
  if (wa) {
    console.log(`[notify] WhatsApp admin link ready for ${order.orderNumber}: ${wa}`);
  }

  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.ORDER_EMAIL_FROM ?? "orders@elvenenoir.com";
  const adminTo = process.env.ORDER_NOTIFY_EMAIL;

  if (!resendKey) {
    console.log(
      `[notify] Order ${order.orderNumber} confirmed for ${order.email} (email skipped — set RESEND_API_KEY)`
    );
    return;
  }

  const itemList = order.items
    .map((i) => `<li>${i.productName} · ${i.size} × ${i.quantity}</li>`)
    .join("");

  const customerHtml = `
    <h2>Thank you for your order</h2>
    <p>Order <strong>${order.orderNumber}</strong> is confirmed.</p>
    <p>Payment method: <strong>${order.paymentMethod}</strong></p>
    <p>Total: <strong>$${(order.totalCents / 100).toFixed(2)} ${order.currency.toUpperCase()}</strong></p>
    <ul>${itemList}</ul>
    <p>We will contact you on ${order.phone ?? "your phone"} for delivery updates. Packaging is always discreet.</p>
  `;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [order.email],
        subject: `Order confirmed — ${order.orderNumber}`,
        html: customerHtml,
      }),
    });

    if (adminTo) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [adminTo],
          subject: `New order ${order.orderNumber} (${order.paymentMethod})`,
          html: `<pre>${buildWhatsAppOrderMessage(order)}</pre>`,
        }),
      });
    }
  } catch (error) {
    console.error("[notify] email failed", error);
  }
}
