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
        primary: {
          // Royal navy base palette
          DEFAULT: "#0A1F44",
          hover: "#081836",
          light: "#E6EEFF",
        },
      },
    },
  },
  plugins: [],
};
export default config;
