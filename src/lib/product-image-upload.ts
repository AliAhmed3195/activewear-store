import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

export const PRODUCT_UPLOAD_DIR = "public/uploads/products";
export const PRODUCT_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
export const PRODUCT_UPLOAD_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

export class ProductImageUploadError extends Error {
  constructor(
    message: string,
    readonly status = 400
  ) {
    super(message);
    this.name = "ProductImageUploadError";
  }
}

export async function saveProductImage(
  input: Buffer,
  mimeType: string
): Promise<{ url: string; bytes: number }> {
  const normalizedMime = mimeType.toLowerCase().split(";")[0].trim();
  if (!PRODUCT_UPLOAD_MIME.has(normalizedMime)) {
    throw new ProductImageUploadError("Only JPEG, PNG, and WebP images are allowed.");
  }
  if (input.byteLength > PRODUCT_UPLOAD_MAX_BYTES) {
    throw new ProductImageUploadError("Image must be 5 MB or smaller.");
  }

  let pipeline = sharp(input, { failOn: "none" }).rotate();
  const meta = await pipeline.metadata();
  if (!meta.width || !meta.height) {
    throw new ProductImageUploadError("Could not read image. Try another file.");
  }

  if (meta.width > 2000) {
    pipeline = pipeline.resize({ width: 2000, withoutEnlargement: true });
  }

  const output = await pipeline.jpeg({ quality: 85, mozjpeg: true }).toBuffer();
  const fileName = `${randomUUID()}.jpg`;
  const dir = path.join(process.cwd(), PRODUCT_UPLOAD_DIR);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fileName), output);

  return { url: `/uploads/products/${fileName}`, bytes: output.byteLength };
}
