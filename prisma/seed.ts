import {
  Gender,
  PrismaClient,
  ProductBadge,
  ProductStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { computeProductPriceCache } from "../src/lib/product-mapper";

const prisma = new PrismaClient();

const P = "/vifactive";

const IMG = {
  camoFront: `${P}/exquisite-camo-front.jpg`,
  camoBack: `${P}/exquisite-camo-back.jpg`,
  gradient: `${P}/exquisite-gradient.jpg`,
  scratch: `${P}/exquisite-scratch.jpg`,
  tee04: `${P}/tee-04.jpg`,
  tee06: `${P}/tee-06.jpg`,
  tee07: `${P}/tee-07.jpg`,
  tee08: `${P}/tee-08.jpg`,
  proGreen: `${P}/pro-tee-green.jpg`,
  pro02: `${P}/pro-tee-02.jpg`,
  pro03: `${P}/pro-tee-03.jpg`,
  pro04: `${P}/pro-tee-04.jpg`,
  jogger:
    "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=800&q=80",
  shorts:
    "https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=800&q=80",
  menTrain:
    "https://images.unsplash.com/photo-1583454110551-21d2eb27fc31?auto=format&fit=crop&w=800&q=80",
  // Product-only shots (no female model photos)
  womensTee:
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
  womensTank:
    "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80",
};

const categories = [
  {
    slug: "mens-tops",
    name: "Men's Tops",
    description: "Performance tees and training tops for men.",
    position: 0,
  },
  {
    slug: "mens-bottoms",
    name: "Men's Bottoms",
    description: "Joggers and shorts built for training.",
    position: 1,
  },
  {
    slug: "womens-tops",
    name: "Women's Tops",
    description: "Performance tops for training and everyday.",
    position: 2,
  },
  {
    slug: "sublimation-tees",
    name: "Sublimation Tees",
    description: "Full sublimation tees — fabric program from VIFACTIVE.",
    position: 3,
  },
  {
    slug: "sets-coords",
    name: "Sets & Co-ords",
    description: "Matching activewear sets for gym and street.",
    position: 4,
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
  imageBack?: string;
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

const SIZES = ["S", "M", "L", "XL", "XXL"];

/** Prices from client fabric rate sheet (PKR) × 100 for cents */
const products: ProductSeed[] = [
  {
    slug: "exquisite-blue-camo-tee",
    name: "Exquisite Blue Camo Tee",
    tagline: "Full sublimation · athletic fit",
    description:
      "Men's full-sublimation performance tee with all-over blue camo print and Exquisite chest mark. Soft cool handfeel — ideal for gym, run, and team kits.",
    material: "Popcorn Lycra",
    gender: Gender.MEN,
    categorySlug: "sublimation-tees",
    badge: ProductBadge.NEW,
    featured: true,
    variants: [
      {
        colorName: "Blue Camo",
        colorSlug: "blue-camo",
        colorHex: "#2563eb",
        priceCentsPkr: 210000,
        priceCentsUsd: 749,
        sizes: SIZES,
        stockPerSize: 10,
        image: IMG.camoFront,
        imageBack: IMG.camoBack,
      },
    ],
  },
  {
    slug: "exquisite-cyan-gradient-tee",
    name: "Exquisite Cyan Gradient Tee",
    tagline: "Gradient print · butter soft",
    description:
      "Men's sublimation tee with cyan-to-navy gradient and Exquisite branding. Smooth butter fabric for all-day training comfort.",
    material: "Butter",
    gender: Gender.MEN,
    categorySlug: "sublimation-tees",
    badge: ProductBadge.BEST_SELLER,
    featured: true,
    variants: [
      {
        colorName: "Cyan Gradient",
        colorSlug: "cyan-gradient",
        colorHex: "#06b6d4",
        priceCentsPkr: 125000,
        priceCentsUsd: 449,
        sizes: SIZES,
        stockPerSize: 12,
        image: IMG.gradient,
      },
    ],
  },
  {
    slug: "exquisite-scratch-gradient-tee",
    name: "Exquisite Scratch Gradient Tee",
    tagline: "Distressed print · tricot knit",
    description:
      "Men's athletic tee with scratch texture over a cyan-to-teal gradient. Tricot construction for a classic sports finish.",
    material: "Tricot",
    gender: Gender.MEN,
    categorySlug: "sublimation-tees",
    featured: true,
    variants: [
      {
        colorName: "Teal Gradient",
        colorSlug: "teal-gradient",
        colorHex: "#0f766e",
        priceCentsPkr: 125000,
        priceCentsUsd: 449,
        sizes: SIZES,
        stockPerSize: 10,
        image: IMG.scratch,
      },
    ],
  },
  {
    slug: "vifactive-pro-mesh-tee",
    name: "VIFACTIVE Pro Mesh Tee",
    tagline: "Breathable chawaldana mesh",
    description:
      "Lightweight men's mesh tee for high-output sessions. Soft, cool, and full-sublimation ready for custom names and numbers.",
    material: "Mesh (Chawaldana)",
    gender: Gender.MEN,
    categorySlug: "mens-tops",
    badge: ProductBadge.NEW,
    featured: true,
    variants: [
      {
        colorName: "Forest",
        colorSlug: "forest",
        colorHex: "#14532d",
        priceCentsPkr: 110000,
        priceCentsUsd: 399,
        sizes: SIZES,
        stockPerSize: 14,
        image: IMG.proGreen,
      },
      {
        colorName: "Graphite",
        colorSlug: "graphite",
        colorHex: "#374151",
        priceCentsPkr: 110000,
        priceCentsUsd: 399,
        sizes: SIZES,
        stockPerSize: 12,
        image: IMG.pro02,
      },
    ],
  },
  {
    slug: "pk-dot-performance-tee",
    name: "P.K Dot Performance Tee",
    tagline: "Piqué texture · classic sports",
    description:
      "Men's P.K Dot knit tee — soft classic handfeel with athletic silhouette. Built for gym and everyday wear.",
    material: "P.K Dot",
    gender: Gender.MEN,
    categorySlug: "mens-tops",
    featured: false,
    variants: [
      {
        colorName: "Black",
        colorSlug: "black",
        colorHex: "#111111",
        priceCentsPkr: 125000,
        priceCentsUsd: 449,
        sizes: SIZES,
        stockPerSize: 12,
        image: IMG.tee04,
      },
    ],
  },
  {
    slug: "sk-training-tee",
    name: "S.K Training Tee",
    tagline: "Durable knit · soft handfeel",
    description:
      "Everyday men's training tee in S.K fabric (150–165 GSM). Soft, feeless wear for long sessions.",
    material: "S.K",
    gender: Gender.MEN,
    categorySlug: "mens-tops",
    featured: false,
    variants: [
      {
        colorName: "Navy",
        colorSlug: "navy",
        colorHex: "#1e3a5f",
        priceCentsPkr: 115000,
        priceCentsUsd: 419,
        sizes: SIZES,
        stockPerSize: 12,
        image: IMG.pro03,
      },
    ],
  },
  {
    slug: "lycra-mesh-pro-tee",
    name: "Lycra Mesh Pro Tee",
    tagline: "Stretch mesh · recovery ready",
    description:
      "Premium men's lycra mesh tee with stretch and breathability. Full sublimation compatible for club and team print.",
    material: "Lycra Mesh",
    gender: Gender.MEN,
    categorySlug: "sublimation-tees",
    badge: ProductBadge.BEST_SELLER,
    featured: true,
    variants: [
      {
        colorName: "Steel",
        colorSlug: "steel",
        colorHex: "#64748b",
        priceCentsPkr: 210000,
        priceCentsUsd: 749,
        sizes: SIZES,
        stockPerSize: 8,
        image: IMG.tee06,
      },
    ],
  },
  {
    slug: "popcorn-lycra-club-tee",
    name: "Popcorn Lycra Club Tee",
    tagline: "Textured cool · team ready",
    description:
      "Popcorn Lycra men's club tee — soft and cool textured knit for custom print kits and daily training.",
    material: "Popcorn Lycra",
    gender: Gender.MEN,
    categorySlug: "sublimation-tees",
    featured: false,
    variants: [
      {
        colorName: "White Print Ready",
        colorSlug: "white",
        colorHex: "#f8fafc",
        priceCentsPkr: 210000,
        priceCentsUsd: 749,
        sizes: SIZES,
        stockPerSize: 10,
        image: IMG.tee07,
      },
    ],
  },
  {
    slug: "vifactive-training-shorts",
    name: "VIFACTIVE Training Shorts",
    tagline: "Light. Fast. Men’s cut.",
    description:
      "Men's performance shorts with quick-dry feel for HIIT, run, and gym. True athletic fit.",
    material: "100% Polyester",
    gender: Gender.MEN,
    categorySlug: "mens-bottoms",
    badge: ProductBadge.BEST_SELLER,
    featured: true,
    variants: [
      {
        colorName: "Black",
        colorSlug: "black",
        colorHex: "#111111",
        priceCentsPkr: 149900,
        priceCentsUsd: 549,
        sizes: ["S", "M", "L", "XL"],
        stockPerSize: 10,
        image: IMG.shorts,
      },
      {
        colorName: "Navy",
        colorSlug: "navy",
        colorHex: "#1e3a5f",
        priceCentsPkr: 149900,
        priceCentsUsd: 549,
        sizes: ["S", "M", "L", "XL"],
        stockPerSize: 8,
        image: IMG.shorts,
      },
    ],
  },
  {
    slug: "vifactive-performance-joggers",
    name: "VIFACTIVE Performance Joggers",
    tagline: "Train hard. Move clean.",
    description:
      "Men's tapered training joggers with stretch comfort for workouts and athleisure.",
    material: "90% Polyester, 10% Spandex",
    gender: Gender.MEN,
    categorySlug: "mens-bottoms",
    featured: true,
    variants: [
      {
        colorName: "Charcoal",
        colorSlug: "charcoal",
        colorHex: "#374151",
        priceCentsPkr: 249900,
        priceCentsUsd: 899,
        sizes: ["S", "M", "L", "XL", "XXL"],
        stockPerSize: 8,
        image: IMG.jogger,
      },
    ],
  },
  {
    slug: "mens-training-set",
    name: "Men's Training Set",
    tagline: "Tee + shorts ready look",
    description:
      "Matched men's training set vibe — pair a VIFACTIVE tee with shorts for gym-to-street sessions.",
    material: "Performance Knit",
    gender: Gender.MEN,
    categorySlug: "sets-coords",
    badge: ProductBadge.SALE,
    featured: false,
    variants: [
      {
        colorName: "Black Set",
        colorSlug: "black-set",
        colorHex: "#111111",
        priceCentsPkr: 329900,
        priceCentsUsd: 1199,
        compareAtCentsPkr: 379900,
        compareAtCentsUsd: 1399,
        sizes: ["S", "M", "L", "XL"],
        stockPerSize: 5,
        image: IMG.menTrain,
      },
    ],
  },
  {
    slug: "womens-performance-tee",
    name: "Women's Performance Tee",
    tagline: "Soft. Light. Train-ready.",
    description:
      "Women's performance tee with breathable knit and clean athletic cut for gym and everyday wear.",
    material: "Butter",
    gender: Gender.WOMEN,
    categorySlug: "womens-tops",
    badge: ProductBadge.NEW,
    featured: true,
    variants: [
      {
        colorName: "Black",
        colorSlug: "black",
        colorHex: "#111111",
        priceCentsPkr: 125000,
        priceCentsUsd: 449,
        sizes: ["XS", "S", "M", "L", "XL"],
        stockPerSize: 10,
        image: IMG.womensTee,
      },
      {
        colorName: "White",
        colorSlug: "white",
        colorHex: "#f8fafc",
        priceCentsPkr: 125000,
        priceCentsUsd: 449,
        sizes: ["XS", "S", "M", "L", "XL"],
        stockPerSize: 8,
        image: IMG.womensTee,
      },
    ],
  },
  {
    slug: "womens-training-tank",
    name: "Women's Training Tank",
    tagline: "Breathable support for sessions",
    description:
      "Women's training tank with soft stretch and light coverage — built for studio, run, and lift days.",
    material: "Mesh (Chawaldana)",
    gender: Gender.WOMEN,
    categorySlug: "womens-tops",
    featured: false,
    variants: [
      {
        colorName: "Navy",
        colorSlug: "navy",
        colorHex: "#1e3a5f",
        priceCentsPkr: 110000,
        priceCentsUsd: 399,
        sizes: ["XS", "S", "M", "L", "XL"],
        stockPerSize: 10,
        image: IMG.womensTank,
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
    authorName: "Faisal Saleem",
    rating: 4,
    body: "Good product with good price. Would recommend for gym wear.",
  },
  {
    authorName: "Ahmed Raza",
    rating: 4,
    body: "Good decent product. Fast delivery and quality stitching.",
  },
  {
    authorName: "Bilal Khan",
    rating: 5,
    body: "Sublimation print looks sharp. Soft fabric for long training sessions.",
  },
  {
    authorName: "Hassan Ali",
    rating: 5,
    body: "True to size men's fit. Ordering team kits next.",
  },
  {
    authorName: "Usman Sheikh",
    rating: 5,
    body: "Quality feels premium for the price. Will buy again.",
  },
];

async function main() {
  console.log("Seeding VIFACTIVE catalog...");

  // Archive old demo women's SKUs that used female model photos
  await prisma.product.updateMany({
    where: { slug: { in: ["acid-wash-crop-top", "ankle-length-legging"] } },
    data: { status: ProductStatus.DRAFT, featured: false },
  });

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
      const images = [
        { url: v.image, label: v.colorName, position: 0 },
        ...(v.imageBack
          ? [{ url: v.imageBack, label: `${v.colorName} back`, position: 1 }]
          : []),
      ];
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
        images,
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
