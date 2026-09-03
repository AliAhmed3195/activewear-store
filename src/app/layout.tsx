import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import Providers from "@/components/Providers";
import LazyCartDrawer from "@/components/store/LazyCartDrawer";
import { storeName, storeTagline, storeUrl } from "@/lib/utils";

const displayFont = Barlow_Condensed({
  variable: "--font-display-face",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const bodyFont = Inter({
  variable: "--font-body-face",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const name = storeName();

export const metadata: Metadata = {
  title: {
    default: `${name} — Premium Activewear`,
    template: `%s · ${name}`,
  },
  description: `${storeTagline()} Premium gym wear and athleisure. PKR & international shipping, COD and card checkout.`,
  metadataBase: new URL(storeUrl()),
  openGraph: {
    type: "website",
    siteName: name,
    title: `${name} — Premium Activewear`,
    description: storeTagline(),
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body className={`${bodyFont.className} antialiased page-enter`}>
        <CartProvider>
          <Providers>
            <div className="film-grain" aria-hidden="true" />
            {children}
            <LazyCartDrawer />
          </Providers>
        </CartProvider>
      </body>
    </html>
  );
}
