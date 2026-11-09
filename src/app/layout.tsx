import type { Metadata } from "next";
import { DM_Sans, Oswald } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import Providers from "@/components/Providers";
import LazyCartDrawer from "@/components/store/LazyCartDrawer";
import { storeName, storeTagline, storeUrl } from "@/lib/utils";

const displayFont = Oswald({
  variable: "--font-display-face",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const bodyFont = DM_Sans({
  variable: "--font-body-face",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const name = storeName();

export const metadata: Metadata = {
  applicationName: name,
  title: {
    default: `${name} | Performance Activewear`,
    template: `%s | ${name}`,
  },
  description: `${storeTagline()} Shop ${name} performance activewear — men, women, kids & custom team kits. COD across Pakistan.`,
  metadataBase: new URL(storeUrl()),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    siteName: name,
    title: `${name} | Performance Activewear`,
    description: storeTagline(),
  },
  twitter: {
    card: "summary",
    title: `${name} | Performance Activewear`,
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
      <body className={`${bodyFont.className} antialiased page-enter peak-theme`}>
        <CartProvider>
          <Providers>
            {children}
            <LazyCartDrawer />
          </Providers>
        </CartProvider>
      </body>
    </html>
  );
}
