// src/app/robots.js

export default function robots() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://wady-way.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/account/", // Private user pages
          "/admin/",
          "/_next/",
          "/pack-form/", // Booking forms
          "/forgot-password/",
          "/login/",
          "/signup/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
