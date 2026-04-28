import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dbvh5i83q/**",
      },
      {
        protocol: "https",
        hostname: "travelami.templaza.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "camp-coding.tech",
        pathname: "/wady-way/user/images/**",
      },
    ],

    // Next.js supports only these output optimization formats here
    formats: ["image/avif", "image/webp"],

    // Allow remote SVGs too if any image comes as svg
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    // Better caching for Lighthouse/performance
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default withNextIntl(nextConfig);
