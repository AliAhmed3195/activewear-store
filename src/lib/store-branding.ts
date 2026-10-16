import "server-only";

import { prisma } from "@/lib/db";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

const BRANDING_ID = "default";

export type StoreBranding = {
  logoUrl: string | null;
};

/** Strip cache-bust query — store only the path in the database. */
export function normalizeLogoPath(url: string | null): string | null {
  if (!url) return null;
  const path = url.split("?")[0].trim();
  return path || null;
}

export function logoUrlWithVersion(path: string | null, updatedAt: Date): string | null {
  const base = normalizeLogoPath(path);
  if (!base) return null;
  return `${base}?v=${updatedAt.getTime()}`;
}

export async function getStoreBrandingUncached(): Promise<StoreBranding> {
  try {
    const row = await prisma.storeBranding.findUnique({ where: { id: BRANDING_ID } });
    if (!row?.logoUrl) return { logoUrl: null };
    return { logoUrl: logoUrlWithVersion(row.logoUrl, row.updatedAt) };
  } catch {
    return { logoUrl: null };
  }
}

export const getStoreBranding = unstable_cache(
  async (): Promise<StoreBranding> => getStoreBrandingUncached(),
  ["store-branding"],
  { tags: ["store-branding"], revalidate: 60 }
);

export async function updateStoreLogoUrl(logoUrl: string | null) {
  const path = normalizeLogoPath(logoUrl);
  await prisma.storeBranding.upsert({
    where: { id: BRANDING_ID },
    create: { id: BRANDING_ID, logoUrl: path },
    update: { logoUrl: path },
  });
  revalidateTag("store-branding", { expire: 0 });
  revalidatePath("/", "layout");
}
