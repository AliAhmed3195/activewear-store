import { auth } from "@/lib/auth";
import {
  BrandLogoUploadError,
  BRAND_UPLOAD_MAX_BYTES,
  removeBrandLogoFile,
  saveBrandLogo,
} from "@/lib/brand-logo-upload";
import { getStoreBrandingUncached, updateStoreLogoUrl } from "@/lib/store-branding";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const entry = formData.get("file");
  if (!entry || !(entry instanceof File)) {
    return NextResponse.json({ error: "Choose an image file" }, { status: 400 });
  }

  if (entry.size > BRAND_UPLOAD_MAX_BYTES) {
    return NextResponse.json({ error: "Logo must be 2 MB or smaller." }, { status: 400 });
  }

  const buffer = Buffer.from(await entry.arrayBuffer());
  if (buffer.byteLength === 0) {
    return NextResponse.json({ error: "Empty file" }, { status: 400 });
  }

  try {
    const mimeType = entry.type || "application/octet-stream";
    const saved = await saveBrandLogo(buffer, mimeType, entry.name);
    await updateStoreLogoUrl(saved.url);
    const branding = await getStoreBrandingUncached();
    return NextResponse.json({ logoUrl: branding.logoUrl, bytes: saved.bytes });
  } catch (err) {
    if (err instanceof BrandLogoUploadError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[store-branding/logo POST]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await removeBrandLogoFile();
    try {
      const { unlink } = await import("fs/promises");
      const path = await import("path");
      await unlink(path.join(process.cwd(), "public/uploads/brand/store-logo.svg"));
    } catch {
      /* ok */
    }
    await updateStoreLogoUrl(null);
    const branding = await getStoreBrandingUncached();
    return NextResponse.json({ logoUrl: branding.logoUrl });
  } catch (err) {
    console.error("[store-branding/logo DELETE]", err);
    return NextResponse.json({ error: "Could not remove logo" }, { status: 500 });
  }
}
