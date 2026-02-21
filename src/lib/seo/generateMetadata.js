// src/lib/seo/generateMetadata.js

import { seoConfig } from "./seoConfig";

export function createMetadata({
  title,
  description,
  keywords = [],
  image,
  url = "/",
  type = "website",
  noindex = false,
  nofollow = false,
} = {}) {
  const siteUrl = seoConfig.siteUrl;
  const fullUrl = `${siteUrl}${url}`;

  // Image
  const ogImage = image
    ? image.startsWith("http")
      ? image
      : `${siteUrl}${image}`
    : `${siteUrl}${seoConfig.defaultOgImage}`;

  // Title
  const fullTitle = title
    ? seoConfig.titleTemplate.replace("%s", title)
    : seoConfig.defaultTitle;

  // Description
  const metaDescription = description || seoConfig.defaultDescription;

  // Keywords
  const metaKeywords = [...seoConfig.defaultKeywords, ...keywords];

  // Robots
  const robots = {
    index: !noindex,
    follow: !nofollow,
    googleBot: {
      index: !noindex,
      follow: !nofollow,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  };

  return {
    title: fullTitle,
    description: metaDescription,
    keywords: metaKeywords,
    robots,

    alternates: {
      canonical: fullUrl,
    },

    openGraph: {
      title: fullTitle,
      description: metaDescription,
      url: fullUrl,
      siteName: seoConfig.siteName,
      type,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      site: seoConfig.social.twitter,
      creator: seoConfig.social.twitter,
      title: fullTitle,
      description: metaDescription,
      images: [ogImage],
    },

    metadataBase: new URL(siteUrl),
  };
}

// 🎯 For Dynamic Pages (packages, hotels, etc.)
export function createDynamicMetadata({
  title,
  description,
  image,
  url,
  price,
  currency = "EGP",
  availability = "InStock",
  rating,
  reviewCount,
}) {
  const baseMetadata = createMetadata({
    title,
    description,
    image,
    url,
    type: "website",
  });

  return {
    ...baseMetadata,
    openGraph: {
      ...baseMetadata.openGraph,
      type: "product",
    },
    other: {
      "product:price:amount": price,
      "product:price:currency": currency,
      "product:availability": availability,
    },
  };
}
