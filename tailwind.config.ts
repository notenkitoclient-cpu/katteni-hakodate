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
        background: "#FAFAF8",
        foreground: "#1A1A1A",
        subtext: "#8C8C8C",
        border: "#E5E5E5",
        accent: "#D94F3D",
      },
      fontFamily: {
        serif: ['"Noto Serif JP"', 'serif'],
        mono: ['"Space Mono"', 'monospace'],
        sans: ['"Noto Sans JP"', 'sans-serif'],
      },
      maxWidth: {
        'popeye': '880px',
      }
    },
  },
  plugins: [],
};
export default config;
