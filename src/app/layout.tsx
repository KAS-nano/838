import type { Metadata } from "next";
import "./globals.css";
import { SiteFrame } from "@/components/navigation/site-frame";

const publicHost = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(publicHost),
  title: { default: "838", template: "%s · 838" },
  description: "Descubra IAs, APIs, runtimes e ferramentas adequadas ao seu computador e ao seu objetivo.",
  applicationName: "838",
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/brand/icon-192.png", type: "image/png", sizes: "192x192" }],
    apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "838 · A IA certa para sua máquina",
    description: "Compare modelos e encontre IAs adequadas ao seu hardware e objetivo.",
    siteName: "838",
    locale: "pt_BR",
    type: "website",
    images: [{ url: "/brand/og-838.png", width: 1200, height: 630, alt: "Símbolo verde do 838 sobre fundo preto" }],
  },
  twitter: { card: "summary_large_image", images: ["/brand/og-838.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body><SiteFrame>{children}</SiteFrame></body></html>;
}
