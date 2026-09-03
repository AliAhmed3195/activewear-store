import { NextRequest, NextResponse } from "next/server";
import { OrderStatus, PaymentMethod } from "@prisma/client";
import { prisma } from "@/lib/db";
import { checkoutIntentSchema } from "@/lib/validations";
import { getProductsByIds } from "@/lib/queries";
import { getStripe } from "@/lib/stripe";
import {
  currencyForCountry,
  getShippingCents,
  getVariantPrice,
  isPakistan,
} from "@/lib/utils";
import { resolveRequestGeo } from "@/lib/request-geo";
import { isOutOfStockError, placeOrderAtomic } from "@/lib/orders";
import { whatsAppNotifyUrl } from "@/lib/notify";
import type { StoreCurrency } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = checkoutIntentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid checkout data" },
        { status: 400 }
      );
    }

    const geo = await resolveRequestGeo(req);
    const { items, shipping, paymentMethod } = parsed.data;
    const currency: StoreCurrency = currencyForCountry(shipping.country);
    const productIds = [...new Set(items.map((i) => i.productId))];
    const products = await getProductsByIds(productIds);
    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

    if (paymentMethod === "COD" && !isPakistan(shipping.country)) {
      return NextResponse.json(
        { error: "Cash on Delivery is only available in Pakistan" },
        { status: 400 }
      );
    }

    if (
      (paymentMethod === "JAZZCASH" || paymentMethod === "EASYPAISA") &&
      !isPakistan(shipping.country)
    ) {
      return NextResponse.json(
        { error: "Wallet payments are only available in Pakistan" },
        { status: 400 }
      );
    }

    if (paymentMethod === "JAZZCASH" || paymentMethod === "EASYPAISA") {
      return NextResponse.json(
        {
          error: `${paymentMethod} integration coming soon. Please use COD or Card for now.`,
        },
        { status: 400 }
      );
    }

    let subtotalCents = 0;
    const lineItems: Array<{
      productId: string;
      variantId: string;
      productName: string;
      productSlug: string;
      colorName: string;
      priceCents: number;
      size: string;
      quantity: number;
    }> = [];

    for (const item of items) {
      const product = productMap[item.productId];
      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 400 });
      }
      const variant = product.variants.find((v) => v.id === item.variantId);
      if (!variant) {
        return NextResponse.json({ error: "Variant not found" }, { status: 400 });
      }
      if (!variant.sizes.includes(item.size)) {
        return NextResponse.json(
          { error: `Invalid size for ${product.name}` },
          { status: 400 }
        );
      }
      const sizeQty = variant.sizeStock?.[item.size] ?? 0;
      if (sizeQty < item.quantity) {
        return NextResponse.json(
          {
            error:
              sizeQty === 0
                ? `${product.name} · ${variant.colorName} · ${item.size} is out of stock`
                : `Only ${sizeQty} left in ${item.size} for ${product.name}`,
          },
          { status: 400 }
        );
      }
      const priceCents = getVariantPrice(variant, currency);
      subtotalCents += priceCents * item.quantity;
      lineItems.push({
        productId: product.id,
        variantId: variant.id,
        productName: product.name,
        productSlug: product.slug,
        colorName: variant.colorName,
        priceCents,
        size: item.size,
        quantity: item.quantity,
      });
    }

    const shippingCents = getShippingCents(subtotalCents, currency);
    const totalCents = subtotalCents + shippingCents;

    const paymentEnum =
      paymentMethod === "COD" ? PaymentMethod.COD : PaymentMethod.CARD;

    if (paymentMethod === "COD") {
      try {
        const order = await placeOrderAtomic({
          items: lineItems,
          shipping,
          subtotalCents,
          shippingCents,
          totalCents,
          currency,
          paymentMethod: paymentEnum,
          status: OrderStatus.PENDING,
          geo,
          notify: true,
        });

        return NextResponse.json({
          mode: "COD",
          orderNumber: order.orderNumber,
          currency,
          subtotalCents,
          shippingCents,
          totalCents,
          whatsAppUrl: whatsAppNotifyUrl(order),
        });
      } catch (error) {
        if (isOutOfStockError(error)) {
          const name =
            error instanceof Error ? error.message.replace("OUT_OF_STOCK:", "") : "Item";
          return NextResponse.json({ error: `${name} is out of stock` }, { status: 409 });
        }
        throw error;
      }
    }

    let order;
    try {
      order = await placeOrderAtomic({
        items: lineItems,
        shipping,
        subtotalCents,
        shippingCents,
        totalCents,
        currency,
        paymentMethod: paymentEnum,
        status: OrderStatus.PENDING,
        geo,
        notify: false,
      });
    } catch (error) {
      if (isOutOfStockError(error)) {
        const name =
          error instanceof Error ? error.message.replace("OUT_OF_STOCK:", "") : "Item";
        return NextResponse.json({ error: `${name} is out of stock` }, { status: 409 });
      }
      throw error;
    }

    const stripe = getStripe();
    const stripeCurrency = currency === "pkr" ? "pkr" : "usd";

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: stripeCurrency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerEmail: shipping.email,
        totalCents: String(totalCents),
      },
      receipt_email: shipping.email,
      shipping: {
        name: shipping.name,
        phone: shipping.phone,
        address: {
          line1: shipping.addressLine1,
          line2: shipping.addressLine2,
          city: shipping.city,
          state: shipping.state,
          postal_code: shipping.postalCode,
          country: shipping.country,
        },
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripePaymentIntentId: paymentIntent.id },
    });

    return NextResponse.json({
      mode: "CARD",
      clientSecret: paymentIntent.client_secret,
      orderNumber: order.orderNumber,
      currency,
      subtotalCents,
      shippingCents,
      totalCents,
    });
  } catch (error) {
    console.error("[checkout/intent]", error);
    return NextResponse.json({ error: "Failed to start checkout" }, { status: 500 });
  }
}
