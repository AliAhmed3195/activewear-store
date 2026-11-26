import { NextRequest, NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/db";
import { customerAddressSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function ownedAddress(customerId: string, id: string) {
  return prisma.customerAddress.findFirst({ where: { id, customerId } });
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await ownedAddress(session.id, id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = customerAddressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  if (data.isDefault) {
    await prisma.customerAddress.updateMany({
      where: { customerId: session.id, NOT: { id } },
      data: { isDefault: false },
    });
  }

  const address = await prisma.customerAddress.update({
    where: { id },
    data: {
      label: data.label,
      name: data.name,
      phone: data.phone || null,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2 || null,
      city: data.city,
      state: data.state || null,
      postalCode: data.postalCode,
      country: data.country.toUpperCase(),
      isDefault: data.isDefault ?? existing.isDefault,
    },
  });

  return NextResponse.json({ address });
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await ownedAddress(session.id, id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.customerAddress.delete({ where: { id } });

  if (existing.isDefault) {
    const next = await prisma.customerAddress.findFirst({
      where: { customerId: session.id },
      orderBy: { updatedAt: "desc" },
    });
    if (next) {
      await prisma.customerAddress.update({
        where: { id: next.id },
        data: { isDefault: true },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
