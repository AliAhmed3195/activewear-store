import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getCustomerSession();
  if (!session) {
    return NextResponse.json({ customer: null });
  }

  const orders = await prisma.order.findMany({
    where: { email: session.email },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      orderNumber: true,
      status: true,
      totalCents: true,
      currency: true,
      createdAt: true,
      items: {
        select: { productName: true, quantity: true, size: true },
      },
    },
  });

  return NextResponse.json({
    customer: { id: session.id, email: session.email, name: session.name },
    orders,
  });
}
