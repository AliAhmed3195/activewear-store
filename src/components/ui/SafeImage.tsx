import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

type SafeImageProps = ImageProps & { fallbackLabel?: string };

/**
 * Server-safe next/image wrapper. Keeps images out of client boundaries
 * on RSC pages (hero, collections, editorial).
 */
export default function SafeImage({ fallbackLabel: _fallbackLabel, className, alt, ...props }: SafeImageProps) {
  return <Image {...props} alt={alt} className={cn(className)} />;
}
