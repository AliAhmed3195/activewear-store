import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { orderLookupSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = orderLookupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Enter a valid order number and email" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: {
        orderNumber: { equals: parsed.data.orderNumber.trim(), mode: "insensitive" },
        email: { equals: parsed.data.email.trim(), mode: "insensitive" },
      },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      orderNumber: order.orderNumber,
      status: order.status,
      paymentMethod: order.paymentMethod,
      name: order.name,
      phone: order.phone,
      city: order.city,
      country: order.country,
      totalCents: order.totalCents,
      currency: order.currency,
      createdAt: order.createdAt,
      items: order.items.map((i) => ({
        productName: i.productName,
        size: i.size,
        quantity: i.quantity,
        priceCents: i.priceCents,
      })),
    });
  } catch (error) {
    console.error("[orders/lookup]", error);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
