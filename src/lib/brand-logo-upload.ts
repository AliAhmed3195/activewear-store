import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

export const BRAND_UPLOAD_DIR = "public/uploads/brand";
export const BRAND_LOGO_FILE = "store-logo.webp";
export const BRAND_UPLOAD_MAX_BYTES = 2 * 1024 * 1024;
export const BRAND_UPLOAD_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/svg+xml"]);

const MAX_WIDTH = 280;
const MAX_HEIGHT = 80;

export class BrandLogoUploadError extends Error {
  constructor(
    message: string,
    readonly status = 400
  ) {
    super(message);
    this.name = "BrandLogoUploadError";
  }
}

export function brandLogoPublicPath() {
  return `/uploads/brand/${BRAND_LOGO_FILE}`;
}

export function brandLogoAbsolutePath() {
  return path.join(process.cwd(), BRAND_UPLOAD_DIR, BRAND_LOGO_FILE);
}

export async function removeBrandLogoFile() {
  try {
    await unlink(brandLogoAbsolutePath());
  } catch {
    /* missing file is fine */
  }
}

const EXT_TO_MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  svg: "image/svg+xml",
};

export function resolveBrandLogoMime(mimeType: string, fileName?: string): string {
  const normalized = mimeType.toLowerCase().split(";")[0].trim();
  if (normalized && normalized !== "application/octet-stream" && BRAND_UPLOAD_MIME.has(normalized)) {
    return normalized;
  }
  const ext = fileName?.split(".").pop()?.toLowerCase();
  if (ext && EXT_TO_MIME[ext]) return EXT_TO_MIME[ext];
  return normalized;
}

export async function saveBrandLogo(
  input: Buffer,
  mimeType: string,
  fileName?: string
): Promise<{ url: string; bytes: number }> {
  const normalizedMime = resolveBrandLogoMime(mimeType, fileName);
  if (!BRAND_UPLOAD_MIME.has(normalizedMime)) {
    throw new BrandLogoUploadError("Use JPEG, PNG, WebP, or SVG.");
  }
  if (input.byteLength > BRAND_UPLOAD_MAX_BYTES) {
    throw new BrandLogoUploadError("Logo must be 2 MB or smaller.");
  }

  if (normalizedMime === "image/svg+xml") {
    const dir = path.join(process.cwd(), BRAND_UPLOAD_DIR);
    await mkdir(dir, { recursive: true });
    const svgPath = path.join(dir, "store-logo.svg");
    await writeFile(svgPath, input);
    await removeBrandLogoFile();
    return { url: "/uploads/brand/store-logo.svg", bytes: input.byteLength };
  }

  let pipeline = sharp(input, { failOn: "none" }).rotate();
  const meta = await pipeline.metadata();
  if (!meta.width || !meta.height) {
    throw new BrandLogoUploadError("Could not read image. Try another file.");
  }

  pipeline = pipeline.resize({
    width: MAX_WIDTH,
    height: MAX_HEIGHT,
    fit: "inside",
    withoutEnlargement: true,
  });

  const hasAlpha = meta.hasAlpha || normalizedMime === "image/png" || normalizedMime === "image/webp";
  const output = hasAlpha
    ? await pipeline.webp({ quality: 90, effort: 4 }).toBuffer()
    : await pipeline.webp({ quality: 88, effort: 4 }).toBuffer();

  const dir = path.join(process.cwd(), BRAND_UPLOAD_DIR);
  await mkdir(dir, { recursive: true });
  try {
    await unlink(path.join(dir, "store-logo.svg"));
  } catch {
    /* ok */
  }
  await writeFile(brandLogoAbsolutePath(), output);

  return { url: brandLogoPublicPath(), bytes: output.byteLength };
}
