import { revalidatePath, revalidateTag } from "next/cache";

/** Invalidate storefront catalog caches after admin product/category writes. */
export function invalidateCatalogCache() {
  // expire: 0 → next request blocks for fresh data (not stale-while-revalidate)
  revalidateTag("catalog", { expire: 0 });
  revalidateTag("categories", { expire: 0 });
  revalidateTag("products", { expire: 0 });
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/api/categories");
}
