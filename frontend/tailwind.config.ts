import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#fff8f4",
          100: "#fdecd8",
          200: "#f5d4b8",
          300: "#e8b896",
          400: "#e89462",
          500: "#eb5e28",
          600: "#c85a28",
          700: "#eb5e28",
          800: "#c44e20",
          900: "#9a3d18",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [typography],
};

export default config;
