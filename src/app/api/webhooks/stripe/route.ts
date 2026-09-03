import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { notifyOrderPlaced } from "@/lib/notify";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("[webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata.orderId;

    const order =
      (orderId
        ? await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } })
        : null) ??
      (await prisma.order.findUnique({
        where: { stripePaymentIntentId: paymentIntent.id },
        include: { items: true },
      }));

    if (!order) {
      console.error("[webhook] no matching PENDING order for", paymentIntent.id);
      return NextResponse.json({ received: true });
    }

    if (order.status === OrderStatus.PAID) {
      return NextResponse.json({ received: true });
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.PAID,
        stripePaymentIntentId: paymentIntent.id,
      },
      include: { items: true },
    });

    void notifyOrderPlaced(updated);
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata.orderId;
    if (orderId) {
      // Keep PENDING so admin can cancel & restock; log for ops
      console.warn("[webhook] payment failed for order", orderId);
    }
  }

  return NextResponse.json({ received: true });
}
