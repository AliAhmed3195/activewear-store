import { NextRequest, NextResponse } from "next/server";
import { prisma, withDbFallback } from "@/lib/db";
import { customOrderSchema } from "@/lib/validations";

function makeReference() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `VF-${stamp}-${rand}`;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = customOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form fields.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const reference = makeReference();

  const created = await withDbFallback(
    () =>
      prisma.customOrder.create({
        data: {
          reference,
          name: data.name,
          email: data.email,
          phone: data.phone,
          organization: data.organization || null,
          productType: data.productType,
          quantity: data.quantity,
          sizeBreakdown: data.sizeBreakdown || null,
          fabricId: data.fabricId || null,
          printNames: data.printNames,
          printNumbers: data.printNumbers,
          printLogo: data.printLogo,
          placement: data.placement || null,
          colorPreference: data.colorPreference || null,
          deadline: data.deadline || null,
          notes: data.notes || null,
        },
      }),
    null
  );

  if (!created) {
    return NextResponse.json(
      { error: "Could not save request right now. Please try again shortly." },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true, reference: created.reference }, { status: 201 });
}
