import { prisma } from "@/lib/db";
import { pickSizeStock, totalFromSizeStock } from "@/lib/size-stock";
import type { ProductFormInput } from "@/lib/validations";

export function buildVariantCreates(variants: ProductFormInput["variants"]) {
  return variants.map((v, vi) => {
    const sizeStock = pickSizeStock(v.sizes, v.sizeStock ?? {});
    const stock = totalFromSizeStock(sizeStock);
    return {
      colorName: v.colorName,
      colorSlug: v.colorSlug,
      colorHex: v.colorHex,
      sku: v.sku,
      priceCentsPkr: v.priceCentsPkr,
      priceCentsUsd: v.priceCentsUsd,
      compareAtCentsPkr: v.compareAtCentsPkr,
      compareAtCentsUsd: v.compareAtCentsUsd,
      sizes: v.sizes,
      sizeStock,
      stock,
      position: v.position ?? vi,
    };
  });
}

export async function attachVariantImages(
  productId: string,
  formVariants: ProductFormInput["variants"],
  createdVariants: Array<{ id: string; position: number }>
) {
  const sorted = [...createdVariants].sort((a, b) => a.position - b.position);
  for (let i = 0; i < sorted.length; i++) {
    const imgs = formVariants[i]?.images ?? [];
    if (imgs.length === 0) continue;
    await prisma.productImage.createMany({
      data: imgs.map((img, j) => ({
        productId,
        variantId: sorted[i].id,
        url: img.url,
        label: img.label,
        position: img.position ?? j,
      })),
    });
  }
}
