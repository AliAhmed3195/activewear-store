import { storeName } from "@/lib/utils";

/** Text wordmark — keeps brand clear without legacy logo assets. */
export default function BrandLogo({ className }: { className?: string }) {
  const name = storeName();
  const [main, ...rest] = name.split(" ");
  const sub = rest.join(" ") || "Activewear";

  return (
    <span className={`brand-wordmark ${className ?? ""}`.trim()}>
      <span className="brand-wordmark-main">{main}</span>
      <span className="brand-wordmark-sub">{sub}</span>
    </span>
  );
}
