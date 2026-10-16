import { revalidatePath, revalidateTag } from "next/cache";

export type InvalidateCatalogOptions = {
  /** Revalidate product detail pages and per-slug cache tags. */
  productSlugs?: string[];
};

/** Invalidate storefront catalog caches after admin product/category writes. */
export function invalidateCatalogCache(options?: InvalidateCatalogOptions) {
  revalidateTag("catalog", { expire: 0 });
  revalidateTag("categories", { expire: 0 });
  revalidateTag("products", { expire: 0 });

  const slugs = [...new Set((options?.productSlugs ?? []).filter(Boolean))];
  for (const slug of slugs) {
    revalidateTag(`product-${slug}`, { expire: 0 });
    revalidatePath(`/product/${slug}`);
  }

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/", "layout");
  revalidatePath("/api/categories");
}
