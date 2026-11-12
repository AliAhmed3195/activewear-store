import StoreHeader from "@/components/store/StoreHeader";
import { getCategoryPreviews } from "@/lib/queries";
import {
  announcementLines,
  getSiteSettings,
  isSaleLive,
} from "@/lib/site-settings";

/** RSC wrapper — ships categories + settings without a client /api round-trip. */
export default async function StoreHeaderServer() {
  let categories: Array<{ slug: string; name: string; productCount: number }> = [];
  let lines: string[] | undefined = undefined;
  let saleLabel: string | null = null;
  let saleText: string | null = null;

  try {
    const [previews, settings] = await Promise.all([
      getCategoryPreviews(),
      getSiteSettings(),
    ]);
    categories = previews
      .filter((c) => c.productCount > 0)
      .map((c) => ({ slug: c.slug, name: c.name, productCount: c.productCount }));
    lines = announcementLines(settings);
    if (isSaleLive(settings)) {
      saleLabel = settings.saleBadgeLabel;
      saleText = settings.saleBannerText || null;
    }
  } catch {
    /* DB not ready — StoreHeader uses built-in defaults */
  }

  return (
    <StoreHeader
      categories={categories}
      announcementLines={lines}
      saleLabel={saleLabel}
      saleText={saleText}
    />
  );
}
