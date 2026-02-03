/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        vibrant: {
          pink: "hsl(330 100% 50%)",
          purple: "hsl(270 100% 50%)",
          yellow: "hsl(50 100% 50%)",
          cyan: "hsl(180 100% 50%)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        brand: {
          green: "#00CE65",
          pink: "#FF00ED",
          orange: "#FF6616",
          blue: "#4E48FF",
          light: "#E4FFAA", // Backgrounds only
        },
        // Legacy carnival colors kept for reference
        carnival: {
          magenta: '#FF00FF',
          neon: '#39FF14',
          hot: '#FF69B4',
          gold: '#FFD700',
        }
      },
      fontFamily: {
        sans: ['Archivo', 'sans-serif'],
        bricolage: ['Bricolage Grotesque', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
