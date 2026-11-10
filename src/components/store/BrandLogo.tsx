"use client";

import Image from "next/image";
import { storeName } from "@/lib/utils";

export default function BrandLogo({ className }: { className?: string }) {
  const name = storeName();

  return (
    <span className={`brand-logo ${className ?? ""}`.trim()}>
      <Image
        src="/brand/vifactive-logo-clear.png"
        alt={name}
        width={280}
        height={190}
        className="brand-logo-img"
        priority
        unoptimized
      />
      <span className="sr-only">{name}</span>
    </span>
  );
}
