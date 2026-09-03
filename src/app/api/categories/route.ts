import { NextResponse } from "next/server";
import { getCategoryPreviews } from "@/lib/queries";

export const revalidate = 120;

export async function GET() {
  try {
    const categories = await getCategoryPreviews();
    return NextResponse.json(
      categories.map((c) => ({
        slug: c.slug,
        name: c.name,
        productCount: c.productCount,
      })),
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
        },
      }
    );
  } catch {
    return NextResponse.json([]);
  }
}
