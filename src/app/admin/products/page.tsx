import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import ProductsTable from "@/components/admin/ProductsTable";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllProductsAdmin } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const products = await getAllProductsAdmin();

  return (
    <AdminShell>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-pearl">Products</h1>
          <p className="font-ui text-sm text-pearl-muted mt-1">
            {products.length} total — create, edit, delete, search
          </p>
        </div>
        <Link href="/admin/products/new" className="btn-copper">
          Add Product
        </Link>
      </div>

      <ProductsTable
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          priceCentsPkr: p.priceCentsPkr,
          stock: p.variants.reduce((s, v) => s + v.stock, 0),
          variantCount: p.variants.length,
          status: p.status,
          featured: p.featured,
          thumbUrl: p.variants[0]?.images[0]?.url ?? p.images[0]?.url ?? null,
          category: p.category ? { name: p.category.name } : null,
        }))}
      />
    </AdminShell>
  );
}
