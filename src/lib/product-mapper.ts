import type {
  Category,
  Product as DbProduct,
  ProductImage as DbProductImage,
  ProductVariant as DbProductVariant,
} from "@prisma/client";
import type { Product, ProductImage, ProductVariant } from "@/types";
import { normalizeSizeStock, totalFromSizeStock } from "@/lib/size-stock";

type VariantWithImages = DbProductVariant & { images: DbProductImage[] };

type ProductWithRelations = DbProduct & {
  category: Category | null;
  images: DbProductImage[];
  variants: VariantWithImages[];
};

function mapImage(img: DbProductImage): ProductImage {
  return {
    id: img.id,
    url: img.url,
    label: img.label,
    position: img.position,
    variantId: img.variantId,
  };
}

function mapVariant(variant: VariantWithImages): ProductVariant {
  const sizeStock = normalizeSizeStock(variant.sizeStock, variant.sizes, variant.stock);
  const stock = totalFromSizeStock(sizeStock) || variant.stock;

  return {
    id: variant.id,
    colorName: variant.colorName,
    colorSlug: variant.colorSlug,
    colorHex: variant.colorHex,
    sku: variant.sku,
    priceCentsPkr: variant.priceCentsPkr,
    priceCentsUsd: variant.priceCentsUsd,
    compareAtCentsPkr: variant.compareAtCentsPkr,
    compareAtCentsUsd: variant.compareAtCentsUsd,
    sizes: variant.sizes,
    sizeStock,
    stock,
    position: variant.position,
    images: variant.images
      .sort((a, b) => a.position - b.position)
      .map(mapImage),
  };
}

export function mapProduct(product: ProductWithRelations): Product {
  const variants = product.variants
    .sort((a, b) => a.position - b.position)
    .map(mapVariant);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    tagline: product.tagline,
    description: product.description,
    material: product.material,
    gender: product.gender,
    categoryId: product.categoryId,
    category: product.category
      ? {
          id: product.category.id,
          slug: product.category.slug,
          name: product.category.name,
          description: product.category.description,
        }
      : null,
    badge: product.badge,
    rating: product.rating,
    reviewCount: product.reviewCount,
    featured: product.featured,
    status: product.status,
    priceCentsPkr: product.priceCentsPkr,
    priceCentsUsd: product.priceCentsUsd,
    variants,
    images: product.images
      .sort((a, b) => a.position - b.position)
      .map(mapImage),
    createdAt: product.createdAt,
  };
}

export function getHeroUrl(product: Product, variantId?: string): string {
  if (variantId) {
    const variant = product.variants.find((v) => v.id === variantId);
    if (variant?.images[0]?.url) return variant.images[0].url;
  }
  const firstVariant = product.variants[0];
  if (firstVariant?.images[0]?.url) return firstVariant.images[0].url;
  return product.images[0]?.url ?? "";
}

export function getGallery(product: Product, variantId?: string): string[] {
  const variant = variantId
    ? product.variants.find((v) => v.id === variantId)
    : product.variants[0];
  if (variant && variant.images.length > 0) {
    return variant.images.map((img) => img.url);
  }
  return product.images.map((img) => img.url);
}

export function allSizes(product: Product): string[] {
  const set = new Set<string>();
  for (const v of product.variants) {
    for (const s of v.sizes) set.add(s);
  }
  const order = ["XS", "S", "M", "L", "XL", "XXL"];
  return [...set].sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

export function minPrices(product: Product): { pkr: number; usd: number } {
  if (product.variants.length === 0) {
    return { pkr: product.priceCentsPkr, usd: product.priceCentsUsd };
  }
  return {
    pkr: Math.min(...product.variants.map((v) => v.priceCentsPkr)),
    usd: Math.min(...product.variants.map((v) => v.priceCentsUsd)),
  };
}

export function computeProductPriceCache(variants: ProductVariant[]): {
  priceCentsPkr: number;
  priceCentsUsd: number;
} {
  if (variants.length === 0) return { priceCentsPkr: 0, priceCentsUsd: 0 };
  return {
    priceCentsPkr: Math.min(...variants.map((v) => v.priceCentsPkr)),
    priceCentsUsd: Math.min(...variants.map((v) => v.priceCentsUsd)),
  };
}
