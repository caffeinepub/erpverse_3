import typography from '@tailwindcss/typography';
import containerQueries from '@tailwindcss/container-queries';
import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['index.html', 'src/**/*.{js,ts,jsx,tsx,html,css}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      fontFamily: {
        sans: ['General Sans', 'Outfit', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'system-ui', 'sans-serif'],
        display: ['Bricolage Grotesque', 'Sora', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', '"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        border: 'oklch(var(--border))',
        input: 'oklch(var(--input))',
        ring: 'oklch(var(--ring) / <alpha-value>)',
        background: 'oklch(var(--background))',
        foreground: 'oklch(var(--foreground))',
        primary: {
          DEFAULT: 'oklch(var(--primary) / <alpha-value>)',
          foreground: 'oklch(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'oklch(var(--secondary) / <alpha-value>)',
          foreground: 'oklch(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'oklch(var(--destructive) / <alpha-value>)',
          foreground: 'oklch(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'oklch(var(--muted) / <alpha-value>)',
          foreground: 'oklch(var(--muted-foreground) / <alpha-value>)'
        },
        accent: {
          DEFAULT: 'oklch(var(--accent) / <alpha-value>)',
          foreground: 'oklch(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'oklch(var(--popover))',
          foreground: 'oklch(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'oklch(var(--card))',
          foreground: 'oklch(var(--card-foreground))'
        },
        success: {
          DEFAULT: 'oklch(var(--success))',
        },
        warning: {
          DEFAULT: 'oklch(var(--warning))',
        },
        chart: {
          1: 'oklch(var(--chart-1))',
          2: 'oklch(var(--chart-2))',
          3: 'oklch(var(--chart-3))',
          4: 'oklch(var(--chart-4))',
          5: 'oklch(var(--chart-5))'
        },
        sidebar: {
          DEFAULT: 'oklch(var(--sidebar))',
          foreground: 'oklch(var(--sidebar-foreground))',
          primary: 'oklch(var(--sidebar-primary))',
          'primary-foreground': 'oklch(var(--sidebar-primary-foreground))',
          accent: 'oklch(var(--sidebar-accent))',
          'accent-foreground': 'oklch(var(--sidebar-accent-foreground))',
          border: 'oklch(var(--sidebar-border))',
          ring: 'oklch(var(--sidebar-ring))'
        },
        cyan: {
          50: 'oklch(0.97 0.04 215)',
          100: 'oklch(0.92 0.08 215)',
          200: 'oklch(0.86 0.12 215)',
          300: 'oklch(0.80 0.16 215)',
          400: 'oklch(0.76 0.18 215)',
          500: 'oklch(0.72 0.19 215)',
          600: 'oklch(0.65 0.18 215)',
          700: 'oklch(0.56 0.16 215)',
          800: 'oklch(0.44 0.13 215)',
          900: 'oklch(0.30 0.09 215)',
        },
        violet: {
          50: 'oklch(0.96 0.04 280)',
          100: 'oklch(0.91 0.09 280)',
          200: 'oklch(0.84 0.14 280)',
          300: 'oklch(0.76 0.18 280)',
          400: 'oklch(0.70 0.21 280)',
          500: 'oklch(0.65 0.22 280)',
          600: 'oklch(0.57 0.20 280)',
          700: 'oklch(0.48 0.18 280)',
          800: 'oklch(0.37 0.14 280)',
          900: 'oklch(0.26 0.09 280)',
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 10px)',
        '3xl': 'calc(var(--radius) + 20px)',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0,0,0,0.05)',
        card: '0 1px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.05)',
        'card-active': '0 0 0 2px oklch(0.45 0.22 280 / 0.5)',
        glow: '0 0 20px oklch(0.45 0.22 280 / 0.2)',
        'glow-sm': '0 0 10px oklch(0.45 0.22 280 / 0.15)',
        'inner-glow': 'inset 0 1px 0 oklch(1 0 0 / 0.5)',
        dialog: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)',
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(oklch(0.55 0.22 280 / 0.05) 1px, transparent 1px), linear-gradient(90deg, oklch(0.55 0.22 280 / 0.05) 1px, transparent 1px)",
        'radial-glow-top': "radial-gradient(ellipse 80% 60% at 50% -10%, oklch(0.55 0.22 280 / 0.08), transparent)",
        'radial-glow-bottom': "radial-gradient(ellipse 60% 40% at 50% 110%, oklch(0.70 0.18 35 / 0.06), transparent)",
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        'fade-in-fast': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to: { opacity: '1', transform: 'translateX(0)' }
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'orb-drift': {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(20px, -20px) scale(1.04)' },
          '66%': { transform: 'translate(-15px, 10px) scale(0.97)' },
        },
        'shimmer': {
          from: { backgroundPosition: '-200% 0' },
          to: { backgroundPosition: '200% 0' },
        },
        'dot-bounce': {
          '0%, 80%, 100%': { transform: 'scale(0.8)', opacity: '0.4' },
          '40%': { transform: 'scale(1.2)', opacity: '1' },
        },
        'progress-bar': {
          '0%': { width: '5%' },
          '20%': { width: '40%' },
          '60%': { width: '75%' },
          '90%': { width: '90%' },
          '100%': { width: '100%' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-in-fast': 'fade-in-fast 0.3s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'slide-up': 'slide-up 0.6s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'float': 'float 4s ease-in-out infinite',
        'orb-drift': 'orb-drift 8s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'dot-bounce': 'dot-bounce 1.2s ease-in-out infinite',
        'progress-bar': 'progress-bar 2.5s ease-out forwards',
      }
    }
  },
  plugins: [typography, containerQueries, animate]
};
