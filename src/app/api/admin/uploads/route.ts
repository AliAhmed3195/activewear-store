import { auth } from "@/lib/auth";
import {
  ProductImageUploadError,
  PRODUCT_UPLOAD_MAX_BYTES,
  saveProductImage,
} from "@/lib/product-image-upload";
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
    return NextResponse.json({ error: "Missing file field" }, { status: 400 });
  }

  if (entry.size > PRODUCT_UPLOAD_MAX_BYTES) {
    return NextResponse.json({ error: "Image must be 5 MB or smaller." }, { status: 400 });
  }

  const buffer = Buffer.from(await entry.arrayBuffer());
  if (buffer.byteLength === 0) {
    return NextResponse.json({ error: "Empty file" }, { status: 400 });
  }

  try {
    const mimeType = entry.type || "application/octet-stream";
    const saved = await saveProductImage(buffer, mimeType);
    return NextResponse.json({
      url: saved.url,
      bytes: saved.bytes,
      name: entry.name,
    });
  } catch (err) {
    if (err instanceof ProductImageUploadError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[admin/uploads]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
