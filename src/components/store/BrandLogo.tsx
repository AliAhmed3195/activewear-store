"use client";

import Image from "next/image";
import { storeName } from "@/lib/utils";

export default function BrandLogo({ className }: { className?: string }) {
  const name = storeName();

  return (
    <span className={`brand-logo ${className ?? ""}`.trim()}>
      <Image
        src="/brand/vifactive-logo.png"
        alt={name}
        width={160}
        height={56}
        className="brand-logo-img"
        priority
      />
      <span className="sr-only">{name}</span>
    </span>
  );
}
