/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          400: '#6685ff',
          500: '#4361ff',
          600: '#2d47e0',
          700: '#1e31b3',
          900: '#0d1566',
        },
        forge: {
          bg: '#080c14',
          card: '#0e1422',
          border: '#1a2340',
          muted: '#8899bb',
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'shimmer': 'shimmer 2s infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(67,97,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(67,97,255,0.05) 1px, transparent 1px)',
        'hero-glow': 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(67,97,255,0.25), transparent)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      }
    }
  },
  plugins: []
}
