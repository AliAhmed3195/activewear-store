import { OrderStatus, PaymentMethod } from "@prisma/client";
import { prisma } from "@/lib/db";
import { generateOrderNumber } from "@/lib/utils";
import { notifyOrderPlaced } from "@/lib/notify";
import type { RequestGeo } from "@/lib/request-geo";
import { normalizeSizeStock, totalFromSizeStock } from "@/lib/size-stock";
import type { StoreCurrency } from "@/types";

export type CheckoutLineItem = {
  productId: string;
  variantId: string;
  productName: string;
  productSlug: string;
  colorName: string;
  priceCents: number;
  size: string;
  quantity: number;
};

export type CheckoutShipping = {
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
};

type PlaceOrderInput = {
  items: CheckoutLineItem[];
  shipping: CheckoutShipping;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  currency: StoreCurrency;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  stripePaymentIntentId?: string | null;
  geo?: RequestGeo | null;
  notify?: boolean;
};

export async function placeOrderAtomic(input: PlaceOrderInput) {
  const order = await prisma.$transaction(async (tx) => {
    for (const item of input.items) {
      const variant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
        select: {
          id: true,
          sizes: true,
          stock: true,
          sizeStock: true,
          product: { select: { name: true } },
        },
      });
      if (!variant) {
        throw new Error(`OUT_OF_STOCK:${item.productName}`);
      }

      if (!variant.sizes.includes(item.size)) {
        throw new Error(`OUT_OF_STOCK:${item.productName}`);
      }

      const sizeStock = normalizeSizeStock(variant.sizeStock, variant.sizes, variant.stock);
      const available = sizeStock[item.size] ?? 0;
      if (available < item.quantity) {
        throw new Error(`OUT_OF_STOCK:${variant.product.name}`);
      }

      sizeStock[item.size] = available - item.quantity;
      const nextTotal = totalFromSizeStock(sizeStock);

      const updated = await tx.productVariant.updateMany({
        where: { id: item.variantId, stock: { gte: item.quantity } },
        data: {
          stock: nextTotal,
          sizeStock,
        },
      });
      if (updated.count === 0) {
        throw new Error(`OUT_OF_STOCK:${variant.product.name}`);
      }
    }

    return tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        email: input.shipping.email,
        name: input.shipping.name,
        phone: input.shipping.phone,
        addressLine1: input.shipping.addressLine1,
        addressLine2: input.shipping.addressLine2,
        city: input.shipping.city,
        state: input.shipping.state,
        postalCode: input.shipping.postalCode,
        country: input.shipping.country,
        currency: input.currency,
        subtotalCents: input.subtotalCents,
        shippingCents: input.shippingCents,
        totalCents: input.totalCents,
        status: input.status,
        paymentMethod: input.paymentMethod,
        stripePaymentIntentId: input.stripePaymentIntentId ?? null,
        clientIp: input.geo?.clientIp ?? null,
        geoCountry: input.geo?.geoCountry ?? null,
        geoRegion: input.geo?.geoRegion ?? null,
        geoCity: input.geo?.geoCity ?? null,
        userAgent: input.geo?.userAgent ?? null,
        items: {
          create: input.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            productSlug: item.productSlug,
            colorName: item.colorName,
            priceCents: item.priceCents,
            size: item.size,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });
  });

  if (input.notify !== false) {
    void notifyOrderPlaced(order);
  }

  return order;
}

export function isOutOfStockError(error: unknown): boolean {
  return error instanceof Error && error.message.startsWith("OUT_OF_STOCK:");
}
