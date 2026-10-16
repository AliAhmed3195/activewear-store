import {
  Gender,
  PrismaClient,
  ProductBadge,
  ProductStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { computeProductPriceCache } from "../src/lib/product-mapper";

const prisma = new PrismaClient();

/** Local demo assets — run `npm run demo:images` to refresh files from CDN sources. */
const IMG = {
  tee: "/uploads/products/performance-oversized-tee.jpg",
  jogger: "/uploads/products/grt-performance-joggers.jpg",
  shorts: "/uploads/products/split-running-shorts.jpg",
  tank: "/uploads/products/stealth-performance-tank.jpg",
  hoodie: "/uploads/products/alpha-roar-hoodie.jpg",
  crop: "/uploads/products/acid-wash-crop-top.jpg",
  coord: "/uploads/products/nomad-knit-coord.jpg",
  legging: "/uploads/products/ankle-length-legging.jpg",
};

const categories = [
  {
    slug: "mens-tops",
    name: "Men's Tops",
    description: "Performance tees, tanks, and hoodies built for training.",
    position: 0,
  },
  {
    slug: "mens-bottoms",
    name: "Men's Bottoms",
    description: "Joggers, shorts, and track pants for every session.",
    position: 1,
  },
  {
    slug: "womens-tops",
    name: "Women's Tops",
    description: "Crop tops, tanks, and performance tops.",
    position: 2,
  },
  {
    slug: "sets-coords",
    name: "Sets & Co-ords",
    description: "Matching activewear sets for gym and street.",
    position: 3,
  },
];

type VariantSeed = {
  colorName: string;
  colorSlug: string;
  colorHex: string;
  priceCentsPkr: number;
  priceCentsUsd: number;
  compareAtCentsPkr?: number;
  compareAtCentsUsd?: number;
  sizes: string[];
  stockPerSize: number;
  image: string;
};

type ProductSeed = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  material: string;
  gender: Gender;
  categorySlug: string;
  badge?: ProductBadge;
  featured: boolean;
  variants: VariantSeed[];
};

const products: ProductSeed[] = [
  {
    slug: "performance-oversized-tee",
    name: "Performance Oversized Tee",
    tagline: "Relaxed fit. Zero compromise.",
    description:
      "Premium cotton-blend oversized tee with moisture-wicking finish. Drop-shoulder cut for unrestricted movement during training and everyday wear.",
    material: "85% Polyester, 15% Spandex",
    gender: Gender.UNISEX,
    categorySlug: "mens-tops",
    badge: ProductBadge.NEW,
    featured: true,
    variants: [
      {
        colorName: "Black",
        colorSlug: "black",
        colorHex: "#111111",
        priceCentsPkr: 229900,
        priceCentsUsd: 2499,
        compareAtCentsPkr: 311300,
        compareAtCentsUsd: 3500,
        sizes: ["S", "M", "L", "XL"],
        stockPerSize: 12,
        image: IMG.tee,
      },
      {
        colorName: "Navy",
        colorSlug: "navy",
        colorHex: "#1e3a5f",
        priceCentsPkr: 229900,
        priceCentsUsd: 2499,
        sizes: ["S", "M", "L", "XL"],
        stockPerSize: 10,
        image: IMG.tee,
      },
    ],
  },
  {
    slug: "split-running-shorts",
    name: "Men's Split Running Shorts",
    tagline: "Built for speed sessions",
    description:
      "Lightweight performance shorts with split hem design and inner brief. Quick-dry fabric keeps you cool on long runs and HIIT days.",
    material: "100% Polyester",
    gender: Gender.MEN,
    categorySlug: "mens-bottoms",
    badge: ProductBadge.BEST_SELLER,
    featured: true,
    variants: [
      {
        colorName: "Navy",
        colorSlug: "navy",
        colorHex: "#1e3a5f",
        priceCentsPkr: 319900,
        priceCentsUsd: 3499,
        compareAtCentsPkr: 379900,
        compareAtCentsUsd: 4200,
        sizes: ["S", "M", "L", "XL"],
        stockPerSize: 8,
        image: IMG.shorts,
      },
      {
        colorName: "Black",
        colorSlug: "black",
        colorHex: "#111111",
        priceCentsPkr: 319900,
        priceCentsUsd: 3499,
        sizes: ["S", "M", "L", "XL"],
        stockPerSize: 6,
        image: IMG.shorts,
      },
      {
        colorName: "Grey",
        colorSlug: "grey",
        colorHex: "#6b7280",
        priceCentsPkr: 319900,
        priceCentsUsd: 3499,
        sizes: ["S", "M", "L", "XL"],
        stockPerSize: 5,
        image: IMG.shorts,
      },
    ],
  },
  {
    slug: "grt-performance-joggers",
    name: "GRT Performance Joggers",
    tagline: "Your go-to training joggers",
    description:
      "Tapered athletic joggers with zip pockets and elastic waistband. Durable build for workouts, sports, and athleisure.",
    material: "90% Polyester, 10% Spandex",
    gender: Gender.MEN,
    categorySlug: "mens-bottoms",
    featured: true,
    variants: [
      {
        colorName: "Grey",
        colorSlug: "grey",
        colorHex: "#6b7280",
        priceCentsPkr: 299900,
        priceCentsUsd: 3299,
        compareAtCentsPkr: 361300,
        compareAtCentsUsd: 4000,
        sizes: ["S", "M", "L", "XL"],
        stockPerSize: 10,
        image: IMG.jogger,
      },
    ],
  },
  {
    slug: "stealth-performance-tank",
    name: "Stealth Performance Tank",
    tagline: "Form-fitting muscle tank",
    description:
      "Sleeveless performance tank with breathable knit and athletic muscle fit. Ideal for lifting, cardio, and layering.",
    material: "100% Polyester",
    gender: Gender.MEN,
    categorySlug: "mens-tops",
    featured: false,
    variants: [
      {
        colorName: "Black",
        colorSlug: "black",
        colorHex: "#111111",
        priceCentsPkr: 179900,
        priceCentsUsd: 1999,
        sizes: ["S", "M", "L", "XL"],
        stockPerSize: 15,
        image: IMG.tank,
      },
    ],
  },
  {
    slug: "acid-wash-crop-top",
    name: "Acid Wash Crop Top",
    tagline: "Street-ready performance",
    description:
      "Drop-shoulder crop top with acid wash finish. 100% cotton construction for breathable comfort during training and recovery.",
    material: "100% Cotton",
    gender: Gender.WOMEN,
    categorySlug: "womens-tops",
    badge: ProductBadge.NEW,
    featured: true,
    variants: [
      {
        colorName: "Pink",
        colorSlug: "pink",
        colorHex: "#ec4899",
        priceCentsPkr: 239900,
        priceCentsUsd: 2599,
        sizes: ["XS", "S", "M", "L"],
        stockPerSize: 8,
        image: IMG.crop,
      },
      {
        colorName: "Beige",
        colorSlug: "beige",
        colorHex: "#d4c4a8",
        priceCentsPkr: 239900,
        priceCentsUsd: 2599,
        sizes: ["XS", "S", "M", "L"],
        stockPerSize: 6,
        image: IMG.crop,
      },
    ],
  },
  {
    slug: "nomad-knit-coord",
    name: "The Nomad Knit Co-ord",
    tagline: "Effortless matching set",
    description:
      "Premium knit co-ord set with relaxed silhouette. Transitions seamlessly from gym to street with elevated comfort.",
    material: "Cotton Blend Knit",
    gender: Gender.UNISEX,
    categorySlug: "sets-coords",
    badge: ProductBadge.SALE,
    featured: true,
    variants: [
      {
        colorName: "Navy",
        colorSlug: "navy",
        colorHex: "#1e3a5f",
        priceCentsPkr: 599900,
        priceCentsUsd: 6499,
        sizes: ["S", "M", "L", "XL"],
        stockPerSize: 4,
        image: IMG.coord,
      },
      {
        colorName: "Asphalt",
        colorSlug: "asphalt",
        colorHex: "#374151",
        priceCentsPkr: 599900,
        priceCentsUsd: 6499,
        sizes: ["S", "M", "L", "XL"],
        stockPerSize: 3,
        image: IMG.coord,
      },
    ],
  },
  {
    slug: "alpha-roar-hoodie",
    name: "Alpha Roar Hoodie",
    tagline: "Warmth meets mobility",
    description:
      "Athletic-fit hoodie with soft-touch fabric. Built for workouts, streetwear, and recovery days.",
    material: "Fleece Blend",
    gender: Gender.MEN,
    categorySlug: "mens-tops",
    featured: false,
    variants: [
      {
        colorName: "Black",
        colorSlug: "black",
        colorHex: "#111111",
        priceCentsPkr: 319900,
        priceCentsUsd: 3499,
        compareAtCentsPkr: 687500,
        compareAtCentsUsd: 7500,
        sizes: ["S", "M", "L", "XL", "XXL"],
        stockPerSize: 6,
        image: IMG.hoodie,
      },
    ],
  },
  {
    slug: "ankle-length-legging",
    name: "Ankle Length Legging",
    tagline: "Slim fit. Full stretch.",
    description:
      "Mid-rise ankle leggings with Great Gears side typography. Poly-spandex blend for squat-proof flexibility.",
    material: "Poly & Spandex Blend",
    gender: Gender.WOMEN,
    categorySlug: "womens-tops",
    featured: false,
    variants: [
      {
        colorName: "Sky Blue",
        colorSlug: "sky-blue",
        colorHex: "#38bdf8",
        priceCentsPkr: 279900,
        priceCentsUsd: 2999,
        compareAtCentsPkr: 346300,
        compareAtCentsUsd: 3800,
        sizes: ["XS", "S", "M", "L"],
        stockPerSize: 7,
        image: IMG.legging,
      },
      {
        colorName: "Maroon",
        colorSlug: "maroon",
        colorHex: "#7f1d1d",
        priceCentsPkr: 279900,
        priceCentsUsd: 2999,
        sizes: ["XS", "S", "M", "L"],
        stockPerSize: 5,
        image: IMG.legging,
      },
    ],
  },
];

const reviews = [
  {
    authorName: "Umair Sajid",
    rating: 5,
    body: "Fitting and fabric is very good, very comfortable to wear. Keep it up!",
  },
  {
    authorName: "Mahvash Shehzad",
    rating: 5,
    body: "Great quality, items are exactly the same as shown in the pictures.",
  },
  {
    authorName: "Mahnoor Hania",
    rating: 5,
    body: "The fit is exactly as shown. Comfortable enough to wear all day, premium fabric.",
  },
  {
    authorName: "Faisal Saleem",
    rating: 4,
    body: "Good product with good price. Would recommend for gym wear.",
  },
  {
    authorName: "Aisha Faisal",
    rating: 5,
    body: "Very nice stuff. Soft and summer friendly — perfect for training.",
  },
  {
    authorName: "Ahmed Raza",
    rating: 4,
    body: "Good decent product. Fast delivery and quality stitching.",
  },
];

async function main() {
  console.log("Seeding activewear store...");

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }

  const categoryMap = Object.fromEntries(
    (await prisma.category.findMany()).map((c) => [c.slug, c.id])
  );

  for (const p of products) {
    const mappedVariants = p.variants.map((v, idx) => {
      const sizeStock: Record<string, number> = {};
      for (const s of v.sizes) sizeStock[s] = v.stockPerSize;
      const stock = v.sizes.length * v.stockPerSize;
      return {
        colorName: v.colorName,
        colorSlug: v.colorSlug,
        colorHex: v.colorHex,
        priceCentsPkr: v.priceCentsPkr,
        priceCentsUsd: v.priceCentsUsd,
        compareAtCentsPkr: v.compareAtCentsPkr ?? null,
        compareAtCentsUsd: v.compareAtCentsUsd ?? null,
        sizes: v.sizes,
        sizeStock,
        stock,
        position: idx,
        images: [{ url: v.image, label: v.colorName, position: 0 }],
      };
    });

    const prices = computeProductPriceCache(
      mappedVariants.map((v) => ({
        id: "",
        colorName: v.colorName,
        colorSlug: v.colorSlug,
        colorHex: v.colorHex,
        sku: null,
        priceCentsPkr: v.priceCentsPkr,
        priceCentsUsd: v.priceCentsUsd,
        compareAtCentsPkr: v.compareAtCentsPkr,
        compareAtCentsUsd: v.compareAtCentsUsd,
        sizes: v.sizes,
        sizeStock: v.sizeStock,
        stock: v.stock,
        position: v.position,
        images: [],
      }))
    );

    await prisma.product.deleteMany({ where: { slug: p.slug } });

    const created = await prisma.product.create({
      data: {
        slug: p.slug,
        name: p.name,
        tagline: p.tagline,
        description: p.description,
        material: p.material,
        gender: p.gender,
        categoryId: categoryMap[p.categorySlug],
        badge: p.badge,
        featured: p.featured,
        status: ProductStatus.ACTIVE,
        rating: 4.5 + Math.random() * 0.4,
        reviewCount: Math.floor(Math.random() * 40) + 10,
        priceCentsPkr: prices.priceCentsPkr,
        priceCentsUsd: prices.priceCentsUsd,
        variants: {
          create: mappedVariants.map((v) => ({
            colorName: v.colorName,
            colorSlug: v.colorSlug,
            colorHex: v.colorHex,
            priceCentsPkr: v.priceCentsPkr,
            priceCentsUsd: v.priceCentsUsd,
            compareAtCentsPkr: v.compareAtCentsPkr,
            compareAtCentsUsd: v.compareAtCentsUsd,
            sizes: v.sizes,
            sizeStock: v.sizeStock,
            stock: v.stock,
            position: v.position,
          })),
        },
      },
      include: { variants: { orderBy: { position: "asc" } } },
    });

    for (let i = 0; i < created.variants.length; i++) {
      const variant = created.variants[i];
      const imgs = mappedVariants[i].images;
      if (imgs.length > 0) {
        await prisma.productImage.createMany({
          data: imgs.map((img) => ({
            productId: created.id,
            variantId: variant.id,
            url: img.url,
            label: img.label,
            position: img.position,
          })),
        });
      }
    }
  }

  await prisma.review.deleteMany();
  for (const r of reviews) {
    await prisma.review.create({
      data: { ...r, approved: true },
    });
  }

  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe2026!";
  const name = process.env.SEED_ADMIN_NAME ?? "Store Admin";
  const hash = await bcrypt.hash(password, 12);

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash: hash, name },
    create: { email, passwordHash: hash, name },
  });

  console.log(`Seeded ${products.length} products, ${reviews.length} reviews`);
  console.log(`Admin: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
