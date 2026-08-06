import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          DEFAULT: "#8D6E63", // Soft Warm Mocha Coffee
          dark: "#6D4C41",
          light: "#A1887F",
        },
        espresso: {
          DEFAULT: "#4E342E", // Soft Dark Brown Text (gentle & warm)
          light: "#5D4037",
        },
        cocoa: {
          DEFAULT: "#A1887F", // Muted Warm Secondary
          light: "#BCAAA4",
        },
        cream: {
          DEFAULT: "#FAF6F0", // Soft Cream Warm Background
          dark: "#F3ECE2",
        },
        latte: {
          DEFAULT: "#FFFFFF", // Clean Warm White Surface
          muted: "#FFFDF9",
        },
        caramel: {
          DEFAULT: "#D7B174", // Soft Gold / Caramel Accent
          dark: "#C69C5C",
          light: "#F3E5D8",
        },
        status: {
          success: "#52B788", // Soft Muted Pastel Emerald
          danger: "#E07A5F",  // Soft Terracotta Warm Red
          warning: "#F4A261",
        },
      },
      fontFamily: {
        serif: ["Georgia", "serif"],
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(141, 110, 99, 0.08)",
        card: "0 2px 12px rgba(78, 52, 46, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
