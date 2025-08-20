// tailwind.config.mjs
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // jeżeli masz katalog src
  ],
  theme: {
    extend: {
      colors: {
        testcolor: "#ff00ff",
      },
    },
  },
  plugins: [],
};
