/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}",
    "./app/**/*.{ts,tsx,js,jsx}",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      screens: {
        mdd: "960px",
      },
      colors: {
        primary: "#10B981",
        offWhite: "#edece8",
        lightWarm: "#e9e1d6",
        goldenOrange: "#dd9933",
        softMintGreen: "#599066",
        paleSpringGreen: "#cce7bf",
        sageGreen: "#b4d7af",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        lato: ["Lato", "sans-serif"],
        oswald: ["Oswald", "sans-serif"],
        tajawal: ["Tajawal", "sans-serif"],
        tangerine: ["Tangerine", "cursive"],
      },
    },
  },
};
