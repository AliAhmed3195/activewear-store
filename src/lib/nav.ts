export type NavLink = {
  label: string;
  href: string;
};

export type NavGroup = {
  label: string;
  href?: string;
  children?: NavLink[];
};

/** Storefront main menu — light + shoppable (Terms lives in footer) */
export const MAIN_NAV: NavGroup[] = [
  { label: "Shop All", href: "/shop" },
  {
    label: "Men",
    href: "/shop?gender=MEN",
    children: [
      { label: "Polo Shirts", href: "/shop?category=mens-polo-shirts" },
      { label: "Trousers", href: "/shop?category=mens-trousers" },
      { label: "Casual Wear", href: "/shop?category=mens-casual-wear" },
      { label: "Sets", href: "/shop?category=mens-sets" },
      { label: "Custom order", href: "/custom" },
    ],
  },
  {
    label: "Women",
    href: "/shop?gender=WOMEN",
    children: [
      { label: "Polo Shirts", href: "/shop?category=womens-polo-shirts" },
      { label: "Shirts", href: "/shop?category=womens-shirts" },
      { label: "Sets", href: "/shop?category=womens-sets" },
      { label: "Activewear", href: "/shop?category=womens-activewear" },
      { label: "Custom order", href: "/custom" },
    ],
  },
  {
    label: "Kids",
    href: "/shop?gender=KIDS",
    children: [
      { label: "Bottoms", href: "/shop?category=kids-bottoms" },
      { label: "Shirts", href: "/shop?category=kids-shirts" },
      { label: "Co-ords / Sets", href: "/shop?category=kids-coords" },
      { label: "Other Kidswear", href: "/shop?category=kids-other" },
      { label: "Custom order", href: "/custom" },
    ],
  },
  { label: "Sale", href: "/shop?sort=rating" },
  { label: "Custom", href: "/custom" },
];

export const STORE_CATEGORIES = [
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
] as const;
