import type { Product } from "@/types";
import { getHeroUrl } from "@/lib/product-mapper";
import { storeName, storeTagline, storeUrl } from "@/lib/utils";

export function organizationJsonLd() {
  const url = storeUrl();
  const email = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim();
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim();

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: storeName(),
    url,
    description: storeTagline(),
    logo: `${url}/brand/vifactive-logo-clear.png`,
    ...(email ? { email } : {}),
    ...(phone ? { telephone: phone } : {}),
  };
}

export function productJsonLd(product: Product) {
  const url = storeUrl();
  const hero = getHeroUrl(product);
  const variant = product.variants[0];
  const price = (variant?.priceCentsPkr ?? product.priceCentsPkr) / 100;
  const inStock = product.variants.some((v) => v.stock > 0);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: variant?.sku ?? product.slug,
    brand: { "@type": "Brand", name: storeName() },
    ...(hero ? { image: [hero.startsWith("http") ? hero : `${url}${hero}`] } : {}),
    ...(product.material ? { material: product.material } : {}),
    offers: {
      "@type": "Offer",
      url: `${url}/product/${product.slug}`,
      priceCurrency: "PKR",
      price: price.toFixed(2),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    ...(product.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating.toFixed(1),
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  const url = storeUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${url}${item.path}`,
    })),
  };
}
