/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FAFAF9",
        ink: "#14171F",
        muted: "#6B7280",
        border: "#E5E7EB",

        brand: {
          DEFAULT: "#2E3A8C",
          light: "#EEF0FB",
        },

        positive: {
          DEFAULT: "#0F9D6B",
          light: "#E7F7F0",
        },

        flagged: {
          DEFAULT: "#D97706",
          light: "#FEF3E2",
        },

        danger: {
          DEFAULT: "#DC2626",
          light: "#FDECEC",
        },
      },

      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};