// src/lib/seo/structuredData.js

import { seoConfig } from "./seoConfig";

// Organization Schema
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: seoConfig.organization.name,
    url: seoConfig.siteUrl,
    logo: `${seoConfig.siteUrl}${seoConfig.organization.logo}`,
    email: seoConfig.organization.email,
    telephone: seoConfig.organization.phone,
    sameAs: [
      `https://facebook.com/${seoConfig.social.facebook}`,
      `https://instagram.com/${seoConfig.social.instagram}`,
      `https://twitter.com/${seoConfig.social.twitter}`,
    ],
  };
}

// Website Schema
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: seoConfig.siteName,
    url: seoConfig.siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${seoConfig.siteUrl}/package-top-search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// 🎯 Travel Package Schema
export function travelPackageSchema({
  name,
  description,
  image,
  url,
  price,
  currency = "EGP",
  duration,
  destination,
  rating,
  reviewCount,
}) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name,
    description,
    image,
    url: `${seoConfig.siteUrl}${url}`,
    touristType: "Adventure",
    itinerary: {
      "@type": "ItemList",
      numberOfItems: duration,
      itemListElement: {
        "@type": "ListItem",
        position: 1,
        name: `${duration} Days Trip`,
      },
    },
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: currency,
      availability: "https://schema.org/InStock",
    },
    ...(rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: rating,
        reviewCount: reviewCount || 0,
      },
    }),
    provider: {
      "@type": "TravelAgency",
      name: seoConfig.organization.name,
    },
  };
}

// 🏨 Hotel Schema
export function hotelSchema({
  name,
  description,
  image,
  url,
  priceRange,
  rating,
  reviewCount,
  address,
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name,
    description,
    image,
    url: `${seoConfig.siteUrl}${url}`,
    priceRange,
    ...(rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: rating,
        reviewCount: reviewCount || 0,
      },
    }),
    ...(address && {
      address: {
        "@type": "PostalAddress",
        ...address,
      },
    }),
  };
}

// 🚗 Transport Schema
export function transportSchema({
  name,
  description,
  image,
  url,
  price,
  currency = "EGP",
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image,
    url: `${seoConfig.siteUrl}${url}`,
    category: "Transportation Service",
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: currency,
      availability: "https://schema.org/InStock",
    },
  };
}

// Breadcrumb Schema
export function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${seoConfig.siteUrl}${item.url}`,
    })),
  };
}

// FAQ Schema
export function faqSchema(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// JSON-LD Component
export function JsonLd({ data }) {
  if (!data) return null;

  const jsonLdArray = Array.isArray(data) ? data : [data];

  return (
    <>
      {jsonLdArray.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
