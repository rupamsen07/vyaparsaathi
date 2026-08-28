import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary-container": "#22c55e",
        "on-primary-container": "#004b1e",
        "primary": "#006e2f",
        "on-primary": "#ffffff",
        "surface": "#f9f9ff",
        "on-surface": "#111c2d",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f0f3ff",
        "surface-container": "#e7eeff",
        "surface-container-highest": "#d8e3fb",
        "outline": "#6d7b6c",
        "outline-variant": "#bccbb9",
        "secondary-container": "#2170e4",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
        body: ["Inter", "sans-serif"],
      }
    },
  },
  plugins: [],
};
export default config;