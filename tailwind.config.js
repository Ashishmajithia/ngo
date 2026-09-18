/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./resources/**/*.blade.php",
    "./resources/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    screens: {
      'xs': '420px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
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
    },
  },
  plugins: [],
};
