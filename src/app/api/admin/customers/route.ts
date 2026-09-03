import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      city: true,
      country: true,
      totalCents: true,
      status: true,
      createdAt: true,
      orderNumber: true,
    },
  });

  type Customer = {
    email: string;
    name: string;
    phone: string | null;
    city: string;
    country: string;
    orderCount: number;
    totalSpentCents: number;
    lastOrderAt: string;
    lastOrderNumber: string;
  };

  const map = new Map<string, Customer>();
  for (const o of orders) {
    const key = o.email.toLowerCase();
    const existing = map.get(key);
    const spent =
      o.status === "CANCELLED" || o.status === "REFUNDED" ? 0 : o.totalCents;
    if (!existing) {
      map.set(key, {
        email: o.email,
        name: o.name,
        phone: o.phone,
        city: o.city,
        country: o.country,
        orderCount: 1,
        totalSpentCents: spent,
        lastOrderAt: o.createdAt.toISOString(),
        lastOrderNumber: o.orderNumber,
      });
    } else {
      existing.orderCount += 1;
      existing.totalSpentCents += spent;
      if (!existing.phone && o.phone) existing.phone = o.phone;
    }
  }

  const customers = [...map.values()].sort(
    (a, b) => new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime()
  );

  return NextResponse.json(customers);
}
