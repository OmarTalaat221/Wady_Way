// src/app/about/page.jsx

import Breadcrumb from "@/components/common/Breadcrumb";
import Newslatter from "@/components/common/Newslatter";
import Footer from "@/components/footer/Footer";
import Home2Activities from "@/components/activities/Home2Activities";
import Home2Team from "@/components/team/Home2Team";
import Home2Blog from "@/components/blog/Home2Blog";
import Home2WhyChoose from "@/components/whyChoose/Home2WhyChoose";
import Home2About from "@/components/about/Home2About";

// 🔥 SEO Imports
import { createMetadata } from "@/lib/seo/generateMetadata";
import { JsonLd, breadcrumbSchema } from "@/lib/seo/structuredData";

// 🎯 SEO Metadata
export const metadata = createMetadata({
  title: "About Us",
  description:
    "Learn about Wady Way - your trusted travel partner. Discover our mission to make travel planning easy and memorable. Meet our team and see why travelers choose us.",
  keywords: [
    "about wady way",
    "travel company",
    "our story",
    "travel team",
    "why choose us",
    "travel mission",
    "company values",
  ],
  url: "/about",
});

const AboutPage = () => {
  return (
    <>
      {/* 🔥 Structured Data */}
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "About Us", url: "/about" },
        ])}
      />

      <Breadcrumb pagename="About Us" pagetitle="About Us" />
      <Home2About />
      <Home2WhyChoose />
      <Home2Activities />
      <Home2Team />
      {/* <Home2Blog /> */}
      <Newslatter />
      <Footer />
    </>
  );
};

export default AboutPage;
