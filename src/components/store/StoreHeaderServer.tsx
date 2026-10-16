import StoreHeader from "@/components/store/StoreHeader";
import { getCategoryPreviews } from "@/lib/queries";
import { getStoreBranding } from "@/lib/store-branding";

/** RSC wrapper — ships categories without a client /api round-trip. */
export default async function StoreHeaderServer() {
  let categories: Array<{ slug: string; name: string; productCount: number }> = [];
  try {
    const previews = await getCategoryPreviews();
    categories = previews
      .filter((c) => c.productCount > 0)
      .map((c) => ({ slug: c.slug, name: c.name, productCount: c.productCount }));
  } catch {
    /* DB not ready */
  }
  const { logoUrl } = await getStoreBranding();
  return <StoreHeader categories={categories} logoUrl={logoUrl} />;
}
