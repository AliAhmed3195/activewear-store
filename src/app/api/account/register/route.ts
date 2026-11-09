import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { setCustomerSessionCookie } from "@/lib/customer-auth";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().max(40).optional(),
  password: z.string().min(6).max(100),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid details" }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const existing = await prisma.customer.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const customer = await prisma.customer.create({
      data: {
        email,
        name: parsed.data.name,
        phone: parsed.data.phone || null,
        passwordHash,
      },
    });

    await setCustomerSessionCookie({
      id: customer.id,
      email: customer.email,
      name: customer.name,
    });

    return NextResponse.json({
      ok: true,
      customer: { id: customer.id, email: customer.email, name: customer.name },
    });
  } catch (error) {
    console.error("[account/register]", error);
    return NextResponse.json({ error: "Could not create account" }, { status: 500 });
  }
}
