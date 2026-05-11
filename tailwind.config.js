import defaultTheme from 'tailwindcss/defaultTheme'
// Import any other plugins you're using

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ['class'],
  content: ['./src/**/*.{jsx,tsx}'], // tell tailwind where to look
  theme: {
    fontFamily: {
      title: ['Bebas Neue', 'sans-serif'],
      text: ['Darker Grotesque', 'sans-serif'],
    },
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        brand: 'var(--brand-radius)',
      },
      borderWidth: {
        brand: 'var(--brand-border-w)',
      },
      boxShadow: {
        brand: 'var(--brand-shadow)',
        'brand-sm': 'var(--brand-shadow-sm)',
      },
      colors: {
        brand: {
          cream: 'var(--brand-cream)',
          'cream-soft': 'var(--brand-cream-soft)',
          paper: 'var(--brand-paper)',
          ink: 'var(--brand-ink)',
          orange: 'var(--brand-orange)',
          'orange-hover': 'var(--brand-orange-hover)',
          venue: 'var(--brand-venue)',
          muted: 'var(--brand-text-muted)',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
