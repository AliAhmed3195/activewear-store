import { NextRequest, NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/db";
import { customerAddressSchema } from "@/lib/validations";

export async function GET() {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const addresses = await prisma.customerAddress.findMany({
    where: { customerId: session.id },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
  });

  return NextResponse.json({ addresses });
}

export async function POST(req: NextRequest) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = customerAddressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  if (data.isDefault) {
    await prisma.customerAddress.updateMany({
      where: { customerId: session.id },
      data: { isDefault: false },
    });
  }

  const count = await prisma.customerAddress.count({ where: { customerId: session.id } });
  const address = await prisma.customerAddress.create({
    data: {
      customerId: session.id,
      label: data.label,
      name: data.name,
      phone: data.phone || null,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2 || null,
      city: data.city,
      state: data.state || null,
      postalCode: data.postalCode,
      country: data.country.toUpperCase(),
      isDefault: data.isDefault || count === 0,
    },
  });

  return NextResponse.json({ address }, { status: 201 });
}
