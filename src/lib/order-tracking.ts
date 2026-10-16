import type { OrderStatus } from "@prisma/client";

export type TrackingStepState = "complete" | "current" | "upcoming" | "skipped";

export interface TrackingStep {
  key: string;
  label: string;
  description: string;
  state: TrackingStepState;
}

export interface TrackingViewModel {
  steps: TrackingStep[];
  progressPercent: number;
  statusLabel: string;
  statusHeadline: string;
  isTerminal: boolean;
  isException: boolean;
}

const STEPS: Omit<TrackingStep, "state">[] = [
  {
    key: "placed",
    label: "Order Placed",
    description: "We received your order and payment details.",
  },
  {
    key: "processing",
    label: "Processing",
    description: "Your items are being picked and packed.",
  },
  {
    key: "shipped",
    label: "Shipped",
    description: "Your parcel has left our warehouse.",
  },
  {
    key: "out_for_delivery",
    label: "Out for Delivery",
    description: "The courier is on the way to your address.",
  },
  {
    key: "delivered",
    label: "Delivered",
    description: "Your order has been delivered successfully.",
  },
];

/** Maps Prisma order status to timeline position (0–4). */
function activeStepIndex(status: OrderStatus): number {
  switch (status) {
    case "PENDING":
      return 0;
    case "PAID":
    case "PROCESSING":
      return 1;
    case "SHIPPED":
      return 3;
    case "DELIVERED":
      return 4;
    case "CANCELLED":
    case "REFUNDED":
      return -1;
    default:
      return 0;
  }
}

export function buildTrackingView(status: OrderStatus): TrackingViewModel {
  if (status === "CANCELLED" || status === "REFUNDED") {
    const steps = STEPS.map((step, index) => ({
      ...step,
      state: index === 0 ? "complete" : ("skipped" as TrackingStepState),
    }));
    return {
      steps,
      progressPercent: 0,
      statusLabel: status === "CANCELLED" ? "Cancelled" : "Refunded",
      statusHeadline:
        status === "CANCELLED"
          ? "This order was cancelled and will not be shipped."
          : "This order was refunded. Contact support if you have questions.",
      isTerminal: true,
      isException: true,
    };
  }

  const active = activeStepIndex(status);
  const delivered = status === "DELIVERED";

  const steps: TrackingStep[] = STEPS.map((step, index) => {
    if (delivered || index < active) {
      return { ...step, state: "complete" };
    }
    if (index === active) {
      return { ...step, state: "current" };
    }
    return { ...step, state: "upcoming" };
  });

  if (delivered) {
    steps.forEach((s) => {
      s.state = "complete";
    });
  }

  const progressPercent =
    delivered ? 100 : Math.min(100, Math.round(((active + 0.35) / (STEPS.length - 1)) * 100));

  const headlines: Record<OrderStatus, string> = {
    PENDING: "Your order is placed. We are confirming payment details.",
    PAID: "Payment confirmed. We are preparing your order.",
    PROCESSING: "Your order is being packed at our facility.",
    SHIPPED: "Your parcel is in transit with the courier.",
    DELIVERED: "Delivered — thank you for shopping with us.",
    CANCELLED: "",
    REFUNDED: "",
  };

  const labels: Record<OrderStatus, string> = {
    PENDING: "Order placed",
    PAID: "Payment confirmed",
    PROCESSING: "Processing",
    SHIPPED: "In transit",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    REFUNDED: "Refunded",
  };

  return {
    steps,
    progressPercent,
    statusLabel: labels[status],
    statusHeadline: headlines[status],
    isTerminal: delivered,
    isException: false,
  };
}

export function formatStatusForDisplay(status: string): string {
  return status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
