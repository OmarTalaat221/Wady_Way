// src/app/page.js

import HomePage from "../components/HomePage/HomePage";
import { createMetadata } from "@/lib/seo/generateMetadata";
import { JsonLd, breadcrumbSchema } from "@/lib/seo/structuredData";

export const metadata = createMetadata({
  title: "Book Your Perfect Trip",
  description:
    "Discover and book amazing travel packages, hotels, transportation, and activities. Customize your perfect vacation with Wady Way - your trusted travel booking platform.",
  keywords: [
    "book trips online",
    "travel packages",
    "hotel booking",
    "vacation deals",
    "tour packages",
    "travel activities",
    "custom travel",
    "adventure travel",
  ],
  url: "/",
});

export default function Home() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", url: "/" }])} />

      <HomePage />
    </>
  );
}
