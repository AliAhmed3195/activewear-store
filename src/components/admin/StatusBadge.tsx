import { cn } from "@/lib/utils";

const STATUS_CLASS: Record<string, string> = {
  PENDING: "is-pending",
  PAID: "is-paid",
  PROCESSING: "is-processing",
  SHIPPED: "is-shipped",
  DELIVERED: "is-delivered",
  CANCELLED: "is-cancelled",
  REFUNDED: "is-refunded",
};

export default function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <span className={cn("status-badge", STATUS_CLASS[status] ?? "is-pending", className)}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
