import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { categoryFormSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = categoryFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const category = await prisma.category.update({
    where: { id },
    data: parsed.data,
  });
  const { invalidateCatalogCache } = await import("@/lib/cache");
  invalidateCatalogCache();
  return NextResponse.json(category);
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) {
    return NextResponse.json(
      { error: `Cannot delete — ${count} product(s) still in this category. Move them first.` },
      { status: 400 }
    );
  }

  await prisma.category.delete({ where: { id } });
  const { invalidateCatalogCache } = await import("@/lib/cache");
  invalidateCatalogCache();
  return NextResponse.json({ success: true });
}
