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
        forest: {
          DEFAULT: "#123f38",
          dark: "#0b2823",
          light: "#1a574e",
        },
        leaf: {
          DEFAULT: "#28745e",
          light: "#349277",
          dark: "#1e5746",
        },
        saffron: {
          DEFAULT: "#f2ad3b",
          light: "#f5bf63",
          dark: "#d99324",
        },
        cream: "#f8f4e9",
        paper: "#fffdf8",
        ink: "#183a35",
        muted: "#58706a",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-dm-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
