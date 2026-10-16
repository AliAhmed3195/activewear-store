"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconArrowRight,
  IconGem,
  IconGlobe,
  IconHeadset,
  IconLock,
  IconTruck,
} from "@/components/ui/icons";
import { cn } from "@/lib/utils";

const BENEFITS = [
  { icon: IconTruck, text: "Free shipping on qualifying orders" },
  { icon: IconGem, text: "Performance fabrics" },
  { icon: IconGlobe, text: "Ships across Pakistan" },
  { icon: IconLock, text: "Secure checkout" },
] as const;

export default function StoreValueStrip() {
  const pathname = usePathname();
  const onTrackPage = pathname === "/track" || pathname.startsWith("/track/");

  if (pathname.startsWith("/admin") || pathname.startsWith("/checkout")) {
    return null;
  }

  return (
    <section className="store-value-strip" aria-label="Store benefits">
      <div className="store-value-strip-inner">
        <ul className="store-value-strip-list">
          {BENEFITS.map((item) => (
            <li key={item.text} className="store-value-strip-item">
              <span className="store-value-strip-icon" aria-hidden="true">
                <item.icon size={15} />
              </span>
              <span>{item.text}</span>
            </li>
          ))}
          <li className="store-value-strip-item store-value-strip-item--track">
            <Link
              href="/track"
              className={cn("store-value-strip-link", onTrackPage && "is-active")}
              aria-current={onTrackPage ? "page" : undefined}
              aria-label="Order tracking — open live order lookup"
            >
              <span className="store-value-strip-icon store-value-strip-icon--live" aria-hidden="true">
                <IconHeadset size={15} />
                <span className="store-value-strip-link-dot" />
              </span>
              <span className="store-value-strip-link-text">
                {!onTrackPage && (
                  <span className="store-value-strip-live-tag" aria-hidden="true">Live</span>
                )}
                <span
                  className={cn("store-value-strip-blink", !onTrackPage && "is-blinking")}
                  aria-hidden="true"
                />
                <span className="store-value-strip-link-label">Order tracking</span>
              </span>
              <span className="store-value-strip-link-cta" aria-hidden="true">
                <IconArrowRight size={12} className="store-value-strip-link-arrow" />
              </span>
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
