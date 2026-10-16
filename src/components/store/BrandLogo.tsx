import { storeName } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  logoUrl?: string | null;
};

/** Image logo when set; otherwise text wordmark. */
export default function BrandLogo({ className, logoUrl }: BrandLogoProps) {
  const name = storeName();

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className={`brand-logo-img ${className ?? ""}`.trim()}
        width={200}
        height={48}
        decoding="async"
      />
    );
  }

  const [main, ...rest] = name.split(" ");
  const sub = rest.join(" ") || "Activewear";

  return (
    <span className={`brand-wordmark ${className ?? ""}`.trim()}>
      <span className="brand-wordmark-main">{main}</span>
      <span className="brand-wordmark-sub">{sub}</span>
    </span>
  );
}
