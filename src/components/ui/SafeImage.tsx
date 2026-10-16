import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

type SafeImageProps = ImageProps & { fallbackLabel?: string };

function isMissingSrc(src: ImageProps["src"]): boolean {
  if (!src) return true;
  if (typeof src === "string") return src.trim().length === 0;
  return false;
}

/**
 * Server-safe next/image wrapper. Keeps images out of client boundaries
 * on RSC pages (hero, collections, editorial).
 */
export default function SafeImage({
  fallbackLabel,
  className,
  alt,
  src,
  fill,
  ...props
}: SafeImageProps) {
  if (isMissingSrc(src)) {
    return (
      <span
        className={cn(
          "safe-image-placeholder",
          fill && "absolute inset-0",
          className
        )}
        role="img"
        aria-label={alt}
      >
        <span className="safe-image-placeholder-text font-ui">
          {(fallbackLabel ?? alt).slice(0, 2).toUpperCase()}
        </span>
      </span>
    );
  }

  return <Image src={src} alt={alt} fill={fill} className={cn(className)} {...props} />;
}
