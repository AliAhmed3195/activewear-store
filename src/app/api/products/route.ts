import { NextRequest, NextResponse } from "next/server";
import { getProductsByIds } from "@/lib/queries";

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("ids") ?? "";
  const ids = [...new Set(raw.split(",").map((id) => id.trim()).filter(Boolean))].slice(0, 40);

  if (ids.length === 0) {
    return NextResponse.json([]);
  }

  try {
    const products = await getProductsByIds(ids);
    const order = new Map(ids.map((id, index) => [id, index]));
    products.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
    return NextResponse.json(products);
  } catch {
    return NextResponse.json([]);
  }
}
