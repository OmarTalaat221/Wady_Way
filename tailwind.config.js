/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  corePlugins: {
    preflight: false, // disables all base styles
  },
  content: [
    "./pages/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}",
    "./app/**/*.{ts,tsx,js,jsx}",
    "./src/**/*.{ts,tsx,js,jsx}",
  ], 
  
  theme: {
    // container: {
    //   screens: {
    //     "2xl": "1400px",
    //   },
    // },
    // fontSize: {
    //   "heading1-bold": [
    //     "36px",
    //     {
    //       lineHeight: "140%",
    //       fontWeight: "700",
    //     },
    //   ],
    //   "heading1-semibold": [
    //     "36px",
    //     {
    //       lineHeight: "140%",
    //       fontWeight: "600",
    //     },
    //   ],
    //   "heading2-bold": [
    //     "30px",
    //     {
    //       lineHeight: "140%",
    //       fontWeight: "700",
    //     },
    //   ],
    //   "heading2-semibold": [
    //     "30px",
    //     {
    //       lineHeight: "140%",
    //       fontWeight: "600",
    //     },
    //   ],
    //   "heading3-bold": [
    //     "24px",
    //     {
    //       lineHeight: "140%",
    //       fontWeight: "700",
    //     },
    //   ],
    //   "heading4-medium": [
    //     "20px",
    //     {
    //       lineHeight: "140%",
    //       fontWeight: "500",
    //     },
    //   ],
    //   "body-bold": [
    //     "18px",
    //     {
    //       lineHeight: "140%",
    //       fontWeight: "700",
    //     },
    //   ],
    //   "body-semibold": [
    //     "18px",
    //     {
    //       lineHeight: "140%",
    //       fontWeight: "600",
    //     },
    //   ],
    //   "body-medium": [
    //     "18px",
    //     {
    //       lineHeight: "140%",
    //       fontWeight: "500",
    //     },
    //   ],
    //   "body-normal": [
    //     "18px",
    //     {
    //       lineHeight: "140%",
    //       fontWeight: "400",
    //     },
    //   ],
    //   "body1-bold": [
    //     "18px",
    //     {
    //       lineHeight: "140%",
    //       fontWeight: "700",
    //     },
    //   ],
    //   "base-regular": [
    //     "16px",
    //     {
    //       lineHeight: "140%",
    //       fontWeight: "400",
    //     },
    //   ],
    //   "base-medium": [
    //     "16px",
    //     {
    //       lineHeight: "140%",
    //       fontWeight: "500",
    //     },
    //   ],
    //   "base-semibold": [
    //     "16px",
    //     {
    //       lineHeight: "140%",
    //       fontWeight: "600",
    //     },
    //   ],
    //   "base1-semibold": [
    //     "16px",
    //     {
    //       lineHeight: "140%",
    //       fontWeight: "600",
    //     },
    //   ],
    //   "small-regular": [
    //     "14px",
    //     {
    //       lineHeight: "140%",
    //       fontWeight: "400",
    //     },
    //   ],
    //   "small-medium": [
    //     "14px",
    //     {
    //       lineHeight: "140%",
    //       fontWeight: "500",
    //     },
    //   ],
    //   "small-semibold": [
    //     "14px",
    //     {
    //       lineHeight: "140%",
    //       fontWeight: "600",
    //     },
    //   ],
    //   "subtle-medium": [
    //     "12px",
    //     {
    //       lineHeight: "16px",
    //       fontWeight: "500",
    //     },
    //   ],
    //   "subtle-semibold": [
    //     "12px",
    //     {
    //       lineHeight: "16px",
    //       fontWeight: "600",
    //     },
    //   ],
    //   "tiny-medium": [
    //     "10px",
    //     {
    //       lineHeight: "140%",
    //       fontWeight: "500",
    //     },
    //   ],
    //   "x-small-semibold": [
    //     "7px",
    //     {
    //       lineHeight: "9.318px",
    //       fontWeight: "600",
    //     },
    //   ],
    // },
    extend: {
      // colors: {
      //   "primary-500": "#877EFF",
      //   "secondary-500": "#FFB620",
      //   "logout-btn": "#FF5A5A",
      //   "navbar-menu": "rgba(16, 16, 18, 0.6)",
      //   "dark-1": "#000000",
      //   "dark-2": "#121417",
      //   "dark-3": "#101012",
      //   "dark-4": "#1F1F22",
      //   "light-1": "#FFFFFF",
      //   "light-2": "#EFEFEF",
      //   "light-3": "#7878A3",
      //   "light-4": "#5C5C7B",
      //   "gray-1": "#697C89",
      //   glassmorphism: "rgba(16, 16, 18, 0.60)",
      //   background: "hsl(var(--background))",
      //   foreground: "hsl(var(--foreground))",
      //   card: {
      //     DEFAULT: "hsl(var(--card))",
      //     foreground: "hsl(var(--card-foreground))",
      //   },
      //   popover: {
      //     DEFAULT: "hsl(var(--popover))",
      //     foreground: "hsl(var(--popover-foreground))",
      //   },
      //   primary: {
      //     DEFAULT: "hsl(var(--primary))",
      //     foreground: "hsl(var(--primary-foreground))",
      //   },
      //   secondary: {
      //     DEFAULT: "hsl(var(--secondary))",
      //     foreground: "hsl(var(--secondary-foreground))",
      //   },
      //   muted: {
      //     DEFAULT: "hsl(var(--muted))",
      //     foreground: "hsl(var(--muted-foreground))",
      //   },
      //   accent: {
      //     DEFAULT: "hsl(var(--accent))",
      //     foreground: "hsl(var(--accent-foreground))",
      //   },
      //   destructive: {
      //     DEFAULT: "hsl(var(--destructive))",
      //     foreground: "hsl(var(--destructive-foreground))",
      //   },
      //   border: "hsl(var(--border))",
      //   input: "hsl(var(--input))",
      //   ring: "hsl(var(--ring))",
      //   chart: {
      //     1: "hsl(var(--chart-1))",
      //     2: "hsl(var(--chart-2))",
      //     3: "hsl(var(--chart-3))",
      //     4: "hsl(var(--chart-4))",
      //     5: "hsl(var(--chart-5))",
      //   },
      // },
      // boxShadow: {
      //   "count-badge": "0px 0px 6px 2px rgba(219, 188, 159, 0.30)",
      //   "groups-sidebar": "-30px 0px 60px 0px rgba(28, 28, 31, 0.50)",
      // },
      // screens: {
      //   xs: "400px",
      // },
      // keyframes: {
      //   "accordion-down": {
      //     from: {
      //       height: 0,
      //     },
      //     to: {
      //       height: "var(--radix-accordion-content-height)",
      //     },
      //   },
      //   "accordion-up": {
      //     from: {
      //       height: "var(--radix-accordion-content-height)",
      //     },
      //     to: {
      //       height: 0,
      //     },
      //   },
      // },
      // animation: {
      //   "accordion-down": "accordion-down 0.2s ease-out",
      //   "accordion-up": "accordion-up 0.2s ease-out",
      // },
    },
  },
  plugins: [],
};
