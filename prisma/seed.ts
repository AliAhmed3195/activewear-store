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
  // Prefer clean client product shots (avoid watermarked supplier frames)
  proGreen: `${P}/tee-04.jpg`,
  pro02: `${P}/tee-06.jpg`,
  pro03: `${P}/tee-07.jpg`,
  pro04: `${P}/exquisite-scratch.jpg`,
  jogger: `${P}/tee-08.jpg`,
  shorts: `${P}/tee-08.jpg`,
  menTrain: `${P}/exquisite-camo-front.jpg`,
  // Product-only shots (no female model photos)
  womensTee: `${P}/exquisite-gradient.jpg`,
  womensTank: `${P}/tee-06.jpg`,
};

const categories = [
  {
    slug: "mens-polo-shirts",
    name: "Men's Polo Shirts",
    description: "Performance and casual polo shirts for men.",
    position: 0,
  },
  {
    slug: "mens-trousers",
    name: "Men's Trousers",
    description: "Joggers, shorts, and training trousers.",
    position: 1,
  },
  {
    slug: "mens-casual-wear",
    name: "Men's Casual Wear",
    description: "Everyday tees and casual activewear for men.",
    position: 2,
  },
  {
    slug: "mens-sets",
    name: "Men's Sets",
    description: "Matching co-ord sets for men.",
    position: 3,
  },
  {
    slug: "womens-polo-shirts",
    name: "Women's Polo Shirts",
    description: "Women's performance polo shirts.",
    position: 4,
  },
  {
    slug: "womens-shirts",
    name: "Women's Shirts",
    description: "Training shirts and tops for women.",
    position: 5,
  },
  {
    slug: "womens-sets",
    name: "Women's Sets",
    description: "Matching women's activewear sets.",
    position: 6,
  },
  {
    slug: "womens-activewear",
    name: "Women's Activewear",
    description: "Tanks, tees, and training essentials for women.",
    position: 7,
  },
  {
    slug: "kids-bottoms",
    name: "Kids Bottoms",
    description: "Comfortable bottoms for kids.",
    position: 8,
  },
  {
    slug: "kids-shirts",
    name: "Kids Shirts",
    description: "Kids performance and casual shirts.",
    position: 9,
  },
  {
    slug: "kids-coords",
    name: "Kids Co-ords / Sets",
    description: "Matching sets for kids.",
    position: 10,
  },
  {
    slug: "kids-other",
    name: "Other Kidswear",
    description: "Additional kids activewear styles.",
    position: 11,
  },
  {
    slug: "accessories",
    name: "Accessories",
    description: "Caps, socks, and training accessories.",
    position: 12,
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
    categorySlug: "mens-casual-wear",
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
    categorySlug: "mens-casual-wear",
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
    categorySlug: "mens-casual-wear",
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
    categorySlug: "mens-polo-shirts",
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
    categorySlug: "mens-polo-shirts",
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
    categorySlug: "mens-polo-shirts",
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
    categorySlug: "mens-casual-wear",
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
    categorySlug: "mens-casual-wear",
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
    categorySlug: "mens-trousers",
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
    categorySlug: "mens-trousers",
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
    categorySlug: "mens-sets",
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
    categorySlug: "womens-activewear",
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
    categorySlug: "womens-activewear",
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
  {
    slug: "womens-studio-set",
    name: "Women's Studio Set",
    tagline: "Matching top + bottom",
    description: "Women's matching studio set for training and everyday movement.",
    material: "Butter",
    gender: Gender.WOMEN,
    categorySlug: "womens-sets",
    badge: ProductBadge.BEST_SELLER,
    featured: true,
    variants: [
      {
        colorName: "Black Set",
        colorSlug: "black-set",
        colorHex: "#111111",
        priceCentsPkr: 299900,
        priceCentsUsd: 1099,
        sizes: ["XS", "S", "M", "L", "XL"],
        stockPerSize: 6,
        image: IMG.scratch,
      },
    ],
  },
  {
    slug: "womens-performance-polo",
    name: "Women's Performance Polo",
    tagline: "Clean polo cut · soft knit",
    description: "Women's polo shirt with breathable knit and athletic fit for training and casual wear.",
    material: "Butter",
    gender: Gender.WOMEN,
    categorySlug: "womens-polo-shirts",
    badge: ProductBadge.NEW,
    featured: true,
    variants: [
      {
        colorName: "Black",
        colorSlug: "black",
        colorHex: "#111111",
        priceCentsPkr: 145000,
        priceCentsUsd: 529,
        sizes: ["XS", "S", "M", "L", "XL"],
        stockPerSize: 8,
        image: IMG.pro04,
      },
    ],
  },
  {
    slug: "womens-training-shirt",
    name: "Women's Training Shirt",
    tagline: "Light shirt for studio days",
    description: "Soft women's training shirt with clean lines and easy movement.",
    material: "Popcorn Lycra",
    gender: Gender.WOMEN,
    categorySlug: "womens-shirts",
    featured: false,
    variants: [
      {
        colorName: "White",
        colorSlug: "white",
        colorHex: "#f8fafc",
        priceCentsPkr: 135000,
        priceCentsUsd: 499,
        sizes: ["XS", "S", "M", "L", "XL"],
        stockPerSize: 8,
        image: IMG.tee06,
      },
    ],
  },
  {
    slug: "kids-performance-tee",
    name: "Kids Performance Tee",
    tagline: "Soft knit for active kids",
    description: "Kids performance tee with soft stretch and durable print — built for play and practice.",
    material: "Butter",
    gender: Gender.KIDS,
    categorySlug: "kids-shirts",
    badge: ProductBadge.NEW,
    featured: true,
    variants: [
      {
        colorName: "Green",
        colorSlug: "green",
        colorHex: "#166534",
        priceCentsPkr: 99000,
        priceCentsUsd: 349,
        sizes: ["XS", "S", "M", "L"],
        stockPerSize: 12,
        image: IMG.proGreen,
      },
    ],
  },
  {
    slug: "kids-training-shorts",
    name: "Kids Practice Tee",
    tagline: "Light tee for practice days",
    description: "Kids practice tee with soft stretch and quick-dry feel for training days.",
    material: "Mesh (Chawaldana)",
    gender: Gender.KIDS,
    categorySlug: "kids-shirts",
    featured: false,
    variants: [
      {
        colorName: "Black",
        colorSlug: "black",
        colorHex: "#111111",
        priceCentsPkr: 89000,
        priceCentsUsd: 319,
        sizes: ["XS", "S", "M", "L"],
        stockPerSize: 12,
        image: IMG.tee08,
      },
    ],
  },
  {
    slug: "kids-coord-set",
    name: "Kids Scratch Print Tee",
    tagline: "Bold print · soft knit",
    description: "Kids performance tee with scratch-print energy — soft knit for practice and play.",
    material: "Butter",
    gender: Gender.KIDS,
    categorySlug: "kids-shirts",
    badge: ProductBadge.BEST_SELLER,
    featured: true,
    variants: [
      {
        colorName: "Ink Print",
        colorSlug: "ink-print",
        colorHex: "#1e3a5f",
        priceCentsPkr: 189000,
        priceCentsUsd: 679,
        sizes: ["XS", "S", "M", "L"],
        stockPerSize: 8,
        image: IMG.scratch,
      },
    ],
  },
  {
    slug: "kids-hoodie-essentials",
    name: "Kids Club Tee",
    tagline: "Everyday kids training tee",
    description: "Soft kids club tee for warm-ups, practice, and everyday activewear.",
    material: "Soft Knit",
    gender: Gender.KIDS,
    categorySlug: "kids-shirts",
    featured: false,
    variants: [
      {
        colorName: "Charcoal",
        colorSlug: "charcoal",
        colorHex: "#374151",
        priceCentsPkr: 159000,
        priceCentsUsd: 579,
        sizes: ["XS", "S", "M", "L"],
        stockPerSize: 8,
        image: IMG.tee07,
      },
    ],
  },
  {
    slug: "training-cap",
    name: "Training Cap",
    tagline: "Lightweight everyday cap",
    description: "Breathable training cap with clean VIFACTIVE-ready look.",
    material: "Cotton Blend",
    gender: Gender.UNISEX,
    categorySlug: "accessories",
    badge: ProductBadge.BEST_SELLER,
    featured: true,
    variants: [
      {
        colorName: "Black",
        colorSlug: "black",
        colorHex: "#111111",
        priceCentsPkr: 149000,
        priceCentsUsd: 549,
        sizes: ["OS"],
        stockPerSize: 25,
        image: `${P}/accessory-cap.jpg`,
      },
    ],
  },
  {
    slug: "performance-socks-pack",
    name: "Performance Socks Pack",
    tagline: "3-pack cushioned socks",
    description: "Cushioned performance socks for training — sold as a 3-pack.",
    material: "Athletic Knit",
    gender: Gender.UNISEX,
    categorySlug: "accessories",
    featured: false,
    variants: [
      {
        colorName: "Mixed",
        colorSlug: "mixed",
        colorHex: "#6b7280",
        priceCentsPkr: 99000,
        priceCentsUsd: 349,
        sizes: ["S", "M", "L"],
        stockPerSize: 20,
        image: `${P}/accessory-socks.jpg`,
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

  // Swap any leftover female-model Unsplash URLs to product shots
  const femaleModelUrls = [
    "photo-1571019614242",
    "photo-1594381898411",
    "photo-1518310383802",
    "photo-1518611012118",
    "photo-1544367560",
    "photo-1518310383802",
  ];
  for (const frag of femaleModelUrls) {
    await prisma.productImage.updateMany({
      where: { url: { contains: frag } },
      data: { url: IMG.womensTee },
    });
  }

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }

  // Remove legacy category slugs from older storefront structure
  await prisma.category.deleteMany({
    where: {
      slug: {
        in: [
          "mens-tops",
          "mens-bottoms",
          "womens-tops",
          "sublimation-tees",
          "sets-coords",
        ],
      },
    },
  });

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

