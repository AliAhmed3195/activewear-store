import { z } from "zod";

export const checkoutLineItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  size: z.string().min(1),
  quantity: z.number().int().min(1).max(10),
});

export const shippingAddressSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z
    .string()
    .min(10, "Phone is required")
    .regex(/^[0-9+\-\s()]{10,20}$/, "Enter a valid phone number"),
  addressLine1: z.string().min(5),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().optional(),
  postalCode: z.string().min(3),
  country: z.string().min(2).max(2),
});

export const checkoutIntentSchema = z.object({
  items: z.array(checkoutLineItemSchema).min(1),
  shipping: shippingAddressSchema,
  paymentMethod: z.enum(["COD", "CARD", "JAZZCASH", "EASYPAISA"]).default("COD"),
});

export const variantFormSchema = z.object({
  colorName: z.string().min(1),
  colorSlug: z.string().min(1),
  colorHex: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  priceCentsPkr: z.number().int().min(1),
  priceCentsUsd: z.number().int().min(1),
  compareAtCentsPkr: z.number().int().optional().nullable(),
  compareAtCentsUsd: z.number().int().optional().nullable(),
  sizes: z.array(z.string()).min(1),
  sizeStock: z.record(z.string(), z.number().int().min(0)).optional(),
  position: z.number().int().default(0),
  images: z
    .array(
      z.object({
        url: z
          .string()
          .min(1)
          .refine(
            (v) => v.startsWith("/") || /^https?:\/\//i.test(v),
            "Use a site path or full https URL"
          ),
        label: z.string().default(""),
        position: z.number().int().default(0),
      })
    )
    .min(1),
});

export const productFormSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  tagline: z.string().min(2),
  description: z.string().min(10),
  material: z.string().optional().nullable(),
  gender: z.enum(["MEN", "WOMEN", "UNISEX"]).default("UNISEX"),
  categoryId: z.string().optional().nullable(),
  badge: z.enum(["NEW", "BEST_SELLER", "SALE"]).optional().nullable(),
  featured: z.boolean().default(false),
  status: z.enum(["DRAFT", "ACTIVE"]).default("ACTIVE"),
  variants: z.array(variantFormSchema).min(1),
  images: z
    .array(
      z.object({
        url: z.string().min(1),
        label: z.string().default(""),
        position: z.number().int().default(0),
      })
    )
    .optional(),
});

export const categoryFormSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  position: z.number().int().default(0),
});

export const reviewFormSchema = z.object({
  productId: z.string().optional().nullable(),
  authorName: z.string().min(2),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional().nullable(),
  body: z.string().min(5),
  approved: z.boolean().default(true),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const orderLookupSchema = z.object({
  orderNumber: z.string().min(4),
  email: z.string().email(),
});

export const customOrderSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z
    .string()
    .min(10)
    .regex(/^[0-9+\-\s()]{10,20}$/, "Enter a valid phone number"),
  organization: z.string().optional().nullable(),
  productType: z.string().min(2),
  quantity: z.number().int().min(6).max(5000),
  sizeBreakdown: z.string().optional().nullable(),
  fabricId: z.string().optional().nullable(),
  printNames: z.boolean().default(false),
  printNumbers: z.boolean().default(false),
  printLogo: z.boolean().default(false),
  placement: z.string().optional().nullable(),
  colorPreference: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type ProductFormInput = z.infer<typeof productFormSchema>;
export type CategoryFormInput = z.infer<typeof categoryFormSchema>;
export type ReviewFormInput = z.infer<typeof reviewFormSchema>;
export type CustomOrderInput = z.infer<typeof customOrderSchema>;
