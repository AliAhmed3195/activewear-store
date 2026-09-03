import type { Gender, ProductBadge, ProductStatus } from "@prisma/client";

export type { Gender, ProductBadge, ProductStatus };

export interface ProductImage {
  id: string;
  url: string;
  label: string;
  position: number;
  variantId?: string | null;
}

export interface ProductVariant {
  id: string;
  colorName: string;
  colorSlug: string;
  colorHex: string | null;
  sku: string | null;
  priceCentsPkr: number;
  priceCentsUsd: number;
  compareAtCentsPkr: number | null;
  compareAtCentsUsd: number | null;
  sizes: string[];
  sizeStock: Record<string, number>;
  stock: number;
  position: number;
  images: ProductImage[];
}

export interface ProductCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  material: string | null;
  gender: Gender;
  categoryId: string | null;
  category: ProductCategory | null;
  badge: ProductBadge | null;
  rating: number;
  reviewCount: number;
  featured: boolean;
  status: ProductStatus;
  priceCentsPkr: number;
  priceCentsUsd: number;
  variants: ProductVariant[];
  images: ProductImage[];
  createdAt?: Date;
}

export interface Review {
  id: string;
  productId: string | null;
  authorName: string;
  rating: number;
  title: string | null;
  body: string;
  createdAt: Date;
}

export interface CartItem {
  productId: string;
  variantId: string;
  productSlug: string;
  productName: string;
  colorName: string;
  priceCents: number;
  currency: string;
  imageUrl: string;
  size: string;
  quantity: number;
}

export type StoreCurrency = "pkr" | "usd";

export interface ShopFilters {
  q?: string;
  category?: string;
  gender?: string;
  size?: string;
  color?: string;
  sort?: "newest" | "price-asc" | "price-desc" | "rating";
  page?: number;
  limit?: number;
  currency?: StoreCurrency;
}

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ShippingAddress {
  name: string;
  email: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface CheckoutLineItem {
  productId: string;
  variantId: string;
  size: string;
  quantity: number;
}
