import type { Metadata, Viewport } from "next"
import Script from "next/script"

import "./globals.css"
import { Footer } from "@/components/site/footer"
import { Header } from "@/components/site/header"
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: { card: "summary_large_image", title: SITE_TITLE, description: SITE_DESCRIPTION },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F2F6FF" },
    { media: "(prefers-color-scheme: dark)", color: "#070C1A" },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/fonts/ferry-vn/1.0.0/fonts/ferry-vn-display-bold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/ferry-vn/1.0.0/fonts/ferry-vn-text-regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <Script src="/boot.js" strategy="beforeInteractive" />
      </head>
      <body className="min-h-dvh">
        <a href="#main" className="skip-link">
          Bỏ qua, tới nội dung chính
        </a>
        <div className="app-backdrop" aria-hidden="true" />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
