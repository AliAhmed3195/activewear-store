import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const patchSchema = z.object({
  id: z.string().min(1),
  status: z
    .enum(["NEW", "QUOTED", "CONFIRMED", "IN_PRODUCTION", "SHIPPED", "DONE", "CANCELLED"])
    .optional(),
  quotedPricePkr: z.number().int().min(0).optional().nullable(),
  adminNotes: z.string().optional().nullable(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await prisma.customOrder.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(rows);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { id, ...data } = parsed.data;
  const updated = await prisma.customOrder.update({
    where: { id },
    data,
  });
  return NextResponse.json(updated);
}
