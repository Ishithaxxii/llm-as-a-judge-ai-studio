/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080910",
        midnight: "#080910",
        surface: "#121024",
        card: "#141229",
        violetDeep: "#32126F",
        steel: "#3B5780",

        primary: "#702CFF",
        secondary: "#54D9FF",
        accent: "#E344C5",
        warm: "#FF815D",

        success: "#22C55E",
        warning: "#FF815D",
        danger: "#E344C5",

        text: "#F5F1F0",
        muted: "#A6ADBF",
      },

      fontFamily: {
        heading: ["Bricolage Grotesque", "sans-serif"],
        body: ["Plus Jakarta Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },

      borderRadius: {
        xl2: "24px",
      },

      boxShadow: {
        glass: "0 18px 48px rgba(8, 9, 16, 0.72)",
        glow: "0 0 48px rgba(112, 44, 255, 0.28)",
      },

      backgroundImage: {
        hero:
          "radial-gradient(circle at 75% 30%, rgba(112, 44, 255, 0.28) 0%, transparent 48%), radial-gradient(circle at 20% 80%, rgba(227, 68, 197, 0.18) 0%, transparent 45%)",
      },

      keyframes: {
        float: {
          "0%,100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-12px)",
          },
        },

        pulseGlow: {
          "0%,100%": {
            opacity: "0.5",
          },
          "50%": {
            opacity: "1",
          },
        },

        fadeUp: {
          from: {
            opacity: "0",
            transform: "translateY(30px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0px)",
          },
        },
      },

      animation: {
        float: "float 6s ease-in-out infinite",
        pulseGlow: "pulseGlow 3s ease-in-out infinite",
        fadeUp: "fadeUp .8s ease forwards",
      },
    },
  },
  plugins: [],
};