import { NextRequest, NextResponse } from "next/server";
import { getProductsByIds } from "@/lib/queries";

export async function GET(req: NextRequest) {
  const ids = (req.nextUrl.searchParams.get("ids") || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 48);

  if (ids.length === 0) {
    return NextResponse.json({ products: [] });
  }

  const products = await getProductsByIds(ids);
  // Preserve wishlist order
  const byId = new Map(products.map((p) => [p.id, p]));
  return NextResponse.json({
    products: ids.map((id) => byId.get(id)).filter(Boolean),
  });
}
