import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";

import "./globals.css";

import { ServiceWorkerRegistration } from "@/components/offline/service-worker-registration";
import { AuthProvider } from "@/components/auth/auth-provider";
import { siteConfig } from "@/constants/site";

/**
 * Both families are loaded through `next/font` so they are self-hosted and
 * preloaded — the CSS variables they set are what the `--font-*` token families
 * in globals.css resolve to:
 *   Inter   → body- and label- styles (UI copy, micro-labels)
 *   Manrope → headline- and display- styles (headings, big numeric values)
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  // Served from `public/manifest.json`.
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: siteConfig.name,
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    siteName: siteConfig.name,
    type: "website",
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  // Keep in sync with `public/manifest.json` → theme_color.
  themeColor: siteConfig.themeColor,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* Global auth session: restores Firebase Auth state on refresh and
            exposes it to every screen (login redirect, header, guard). */}
        <AuthProvider>{children}</AuthProvider>
        {/* Registers public/sw.js only when NEXT_PUBLIC_ENABLE_SERVICE_WORKER=true */}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
