// src/lib/seo/seoConfig.js

export const seoConfig = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://wady-way.vercel.app",

  siteName: "Wadi Way",
  defaultTitle: "Wadi Way - Book Your Perfect Trip",
  titleTemplate: "%s | Wadi Way",

  defaultDescription:
    "Discover and book amazing travel packages, hotels, transportation, and activities. Plan your perfect trip with Wadi Way - your trusted travel booking platform.",

  defaultKeywords: [
    "wady way",
    "travel packages",
    "book hotels",
    "travel activities",
    "transportation booking",
    "vacation packages",
    "trip planning",
    "travel booking",
    "holiday packages",
    "tour packages",
    "book trips online",
    "travel deals",
    "adventure travel",
    "family vacation",
    // Oman specific (للبداية)
    "oman tours",
    "oman travel",
    "oman packages",
    "muscat tours",
  ],

  social: {
    twitter: "@wadyway",
    facebook: "wadyway",
    instagram: "wadyway",
  },

  organization: {
    name: "Wadi Way",
    logo: "/images/logo.png",
    email: "support@wadyway.com", // 🔴 غيّره
    phone: "+968XXXXXXXX", // 🔴 رقم عُماني
    address: {
      addressCountry: "OM", // Oman
      // ممكن تضيف تفاصيل أكتر لاحقاً
    },
  },

  defaultOgImage: "/og-image.png",
};
