// src/app/layout.js

import "../../public/assets/css/bootstrap-icons.css";
import "../../public/assets/css/all.min.css";
import "../../public/assets/css/boxicons.min.css";
import "../../public/assets/css/fontawesome.min.css";
import "../../public/assets/css/swiper-bundle.min.css";
import "../../public/assets/css/nice-select.css";
import "react-modal-video/css/modal-video.css";
import "../../public/assets/css/slick-theme.css";
import "../../public/assets/css/slick.css";
import "../../public/assets/css/bootstrap-datetimepicker.min.css";
import "react-datepicker/dist/react-datepicker.css";
import "../../public/assets/css/bootstrap.min.css";
import "yet-another-react-lightbox/styles.css";
import "../../public/assets/css/style.css";
import "../../public/assets/css/dashboard.css";
import "../../public/assets/css/index.css";
import "react-calendar/dist/Calendar.css";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./globals.css";
import "leaflet/dist/leaflet.css";

import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import Header from "../components/header/Header";
import { Toaster } from "react-hot-toast";
import RouteProtection from "../components/auth/RouteProtection";
import StoreProvider from "./StoreProvider";
import QueryProvider from "../uitils/QueryProvider";
import MobileHeader from "../components/mobileHeader/MobileHeader";
import NotificationHandler from "../components/notifications/NotificationHandler";
import ToastContainer from "../components/notifications/ToastContainer";

// 🔥 SEO Imports
import { seoConfig } from "@/lib/seo/seoConfig";
import {
  JsonLd,
  organizationSchema,
  websiteSchema,
} from "@/lib/seo/structuredData";

// 🎯 Global Metadata
export const metadata = {
  // Base URL
  metadataBase: new URL(seoConfig.siteUrl),

  // Title Configuration
  title: {
    default: seoConfig.defaultTitle,
    template: seoConfig.titleTemplate, // '%s | Wady Way'
  },

  // Description
  description: seoConfig.defaultDescription,

  // Keywords
  keywords: seoConfig.defaultKeywords,

  // Authors & Creator
  authors: [{ name: seoConfig.organization.name }],
  creator: seoConfig.organization.name,
  publisher: seoConfig.organization.name,

  // Application Name
  applicationName: seoConfig.siteName,

  // Category
  category: "travel",

  // Icons & Favicons
  icons: {
    icon: [
      {
        url: "https://res.cloudinary.com/dkc5klynm/image/upload/v1769242456/W_eaaxsn.png",
        sizes: "any",
      },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "android-chrome-192x192", url: "/android-chrome-192x192.png" },
      { rel: "android-chrome-512x512", url: "/android-chrome-512x512.png" },
    ],
  },

  // Manifest
  manifest: "/site.webmanifest",

  // Open Graph (Global defaults)
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["ar_EG"], // Arabic locale
    siteName: seoConfig.siteName,
    images: [
      {
        url: seoConfig.defaultOgImage,
        width: 1200,
        height: 630,
        alt: seoConfig.siteName,
      },
    ],
  },

  // Twitter Card (Global defaults)
  twitter: {
    card: "summary_large_image",
    site: seoConfig.social.twitter,
    creator: seoConfig.social.twitter,
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Verification (Google Search Console - هتضيفه لاحقاً)
  // verification: {
  //   google: 'your-google-verification-code',
  //   yandex: 'your-yandex-verification-code',
  //   bing: 'your-bing-verification-code',
  // },

  // Other
  referrer: "origin-when-cross-origin",
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
};

// 🌍 Viewport (Separate export for Next.js 14+)
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default async function RootLayout({ children }) {
  const locale = await getLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const messages = await getMessages();

  return (
    <html lang={locale} dir={dir}>
      <head>
        {/* 🔥 Structured Data (JSON-LD) */}
        <JsonLd data={[organizationSchema(), websiteSchema()]} />

        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>

      <body className="min-h-screen">
        <QueryProvider>
          <StoreProvider>
            <NextIntlClientProvider messages={messages}>
              <NotificationHandler>
                <RouteProtection>
                  <Header currentLocale={locale} />
                  <MobileHeader currentLocale={locale} />
                  {children}
                </RouteProtection>
              </NotificationHandler>
            </NextIntlClientProvider>
            <ToastContainer />
            <Toaster />
          </StoreProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
