import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import StoreHeader from "@/components/store/StoreHeaderServer";
import StoreFooter from "@/components/store/StoreFooterServer";
import ProductCard from "@/components/store/ProductCard";
import ProductDetailView from "@/components/store/ProductDetailView";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";
import { getHeroUrl } from "@/lib/product-mapper";

export const revalidate = 300;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };

  return {
    title: `${product.name} — Elvene Noir`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.tagline,
      images: getHeroUrl(product) ? [{ url: getHeroUrl(product) }] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || product.status !== "ACTIVE") notFound();

  const related = await getRelatedProducts(product.id, product.categoryId, 4);

  return (
    <div className="store-page">
      <StoreHeader />
      <main className="store-main">
        <nav className="breadcrumb font-ui text-xs text-pearl-muted tracking-widest capitalize">
          <Link href="/" className="hover:text-blush transition-colors">
            Home
          </Link>
          <span className="mx-2 opacity-40">/</span>
          <Link href="/shop" className="hover:text-blush transition-colors">
            Shop
          </Link>
          <span className="mx-2 opacity-40">/</span>
          <span className="text-pearl">{product.name}</span>
        </nav>

        <ProductDetailView product={product} />

        {related.length > 0 && (
          <section className="related-section">
            <span className="section-eyebrow">You May Also Love</span>
            <h2 className="font-display text-2xl md:text-3xl text-pearl mt-2">Related Pieces</h2>
            <div className="product-row mt-8">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>
      <StoreFooter />
    </div>
  );
}
