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
          DEFAULT: "#00b050",
          dark: "#009040",
          light: "#00d060",
        },
      },
      fontFamily: {
        comic: ['"Comic Sans MS"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
