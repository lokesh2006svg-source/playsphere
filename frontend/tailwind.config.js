/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        court: {
          950: "#090A0D", // Deepest near-black base
          900: "#0F1115", // Deep dark navy/charcoal background
          850: "#161920", // Secondary background / card surface
          800: "#1A1D24", // Elevated cards, modals, table rows
          750: "#222630", // Interactive hover backgrounds
          700: "#2A2D35", // Subtle dark gold/gray borders & dividers
          600: "#3D4350",
          500: "#656C7D",
        },
        gold: {
          50: "#FAF7EE",
          100: "#F5EECD",
          200: "#EAD994",
          300: "#DEC25B",
          400: "#D4AF37", // Rich metallic championship gold
          DEFAULT: "#D4AF37",
          hover: "#C59F2D",
          dark: "#9E7B1B",
          glow: "#F0B90B",
          light: "#F7E199",
          muted: "#A89568",
        },
        turf: {
          DEFAULT: "#D4AF37", // Mapped to Championship Gold for primary accents
          hover: "#C59F2D",   // Deep gold hover
          glow: "#F0B90B",    // Luminous bright gold
          dark: "#9E7B1B",    // Deep bronze gold
          light: "#F7E199",   // Champagne gold
        },
        action: {
          DEFAULT: "#E5B83B", // Warm metallic amber-gold accent
          hover: "#D4A526",
          light: "#FCE3A1",
        },
        cream: {
          DEFAULT: "#F5F0E6", // Off-white / cream primary text
          muted: "#9B9691",   // Muted warm gray secondary text
        },
        success: {
          DEFAULT: "#10B981", // Muted emerald green for "Confirmed", "Paid", "Live"
          hover: "#059669",
          dark: "#064E3B",
          light: "#34D399",
        },
      },
      fontFamily: {
        sans: ["Outfit", "Inter", "system-ui", "sans-serif"],
        display: ["Outfit", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-subtle": "bounce 2s infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(212, 175, 55, 0.4)" },
          "100%": { boxShadow: "0 0 20px rgba(212, 175, 55, 0.8)" },
        },
      },
    },
  },
  plugins: [],
};
