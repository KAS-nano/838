import type { Metadata } from "next";
import "./globals.css";
import { SiteFrame } from "@/components/navigation/site-frame";

export const metadata: Metadata = {
  title: { default: "838", template: "%s · 838" },
  description: "Descubra IAs, APIs, runtimes e ferramentas adequadas ao seu computador e ao seu objetivo.",
  applicationName: "838",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body><SiteFrame>{children}</SiteFrame></body></html>;
}
