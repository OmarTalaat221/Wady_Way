// src/app/sitemap.js

export default async function sitemap() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://wady-way.vercel.app";

  // Static pages
  const staticPages = [
    { url: "", priority: 1.0, changeFrequency: "daily" },
    { url: "/about", priority: 0.8, changeFrequency: "monthly" },
    { url: "/contact", priority: 0.7, changeFrequency: "monthly" },
    { url: "/faq", priority: 0.7, changeFrequency: "monthly" },
    { url: "/gallery", priority: 0.6, changeFrequency: "weekly" },
    { url: "/blog", priority: 0.8, changeFrequency: "weekly" },
    { url: "/community", priority: 0.7, changeFrequency: "weekly" },
    { url: "/package-top-search", priority: 0.9, changeFrequency: "daily" },
    { url: "/Team", priority: 0.5, changeFrequency: "monthly" },
    { url: "/wishlist", priority: 0.5, changeFrequency: "daily" },
    { url: "/activities", priority: 0.8, changeFrequency: "weekly" },
    { url: "/hotel-suits", priority: 0.8, changeFrequency: "weekly" },
    { url: "/transport", priority: 0.8, changeFrequency: "weekly" },
  ];

  const staticSitemap = staticPages.map((page) => ({
    url: `${siteUrl}${page.url}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  // 🔴 TODO: Dynamic pages (packages, hotels, etc.)
  // هنضيفها لما تديني الـ API endpoints
  // const packages = await fetchPackages();
  // const packagesSitemap = packages.map((pkg) => ({
  //   url: `${siteUrl}/package/package-details/${pkg.id}`,
  //   lastModified: new Date(pkg.updatedAt),
  //   changeFrequency: 'weekly',
  //   priority: 0.8,
  // }));

  return [
    ...staticSitemap,
    // ...packagesSitemap,
  ];
}
