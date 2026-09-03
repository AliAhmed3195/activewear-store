import AdminShell from "@/components/admin/AdminShell";
import ProductForm from "@/components/admin/ProductForm";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getCategories } from "@/lib/queries";
import { prisma } from "@/lib/db";
import { normalizeSizeStock } from "@/lib/size-stock";

export const dynamic = "force-dynamic";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          orderBy: { position: "asc" },
          include: { images: { orderBy: { position: "asc" } } },
        },
      },
    }),
    getCategories(),
  ]);

  if (!product) notFound();

  return (
    <AdminShell>
      <h1 className="font-display text-2xl text-pearl mb-6">Edit Product</h1>
      <ProductForm
        categories={categories}
        initial={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          tagline: product.tagline,
          description: product.description,
          material: product.material,
          gender: product.gender,
          categoryId: product.categoryId,
          badge: product.badge,
          featured: product.featured,
          status: product.status,
          variants: product.variants.map((v) => ({
            colorName: v.colorName,
            colorSlug: v.colorSlug,
            colorHex: v.colorHex,
            priceCentsPkr: v.priceCentsPkr,
            priceCentsUsd: v.priceCentsUsd,
            compareAtCentsPkr: v.compareAtCentsPkr,
            compareAtCentsUsd: v.compareAtCentsUsd,
            sizes: v.sizes,
            sizeStock: normalizeSizeStock(v.sizeStock, v.sizes, v.stock),
            stock: v.stock,
            images: v.images.map((img) => ({ url: img.url, label: img.label })),
          })),
        }}
      />
    </AdminShell>
  );
}
