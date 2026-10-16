import { auth } from "@/lib/auth";
import { getStoreBrandingUncached } from "@/lib/store-branding";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const branding = await getStoreBrandingUncached();
  return NextResponse.json(branding);
}
