/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'var(--font-inter)', 'sans-serif'],
        display: ['JetBrains Mono', 'Fira Code', 'var(--font-outfit)', 'monospace'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        zinc: {
          50: '#F9FAFB',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#52525B',
          700: '#323232',
          800: '#1A1A1A',
          900: '#0A0A0A',
          950: '#000000',
        },
        indigo: {
          500: '#0052FF',
          600: '#0042CC',
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#0052FF',
          600: '#0042CC',
          700: '#003199',
          800: '#002166',
          900: '#001033',
          950: '#00081a',
        }
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'float': '0 12px 30px -4px rgba(0, 0, 0, 0.8), 0 4px 10px -2px rgba(0, 0, 0, 0.4)',
        'glow': '0 0 20px rgba(0, 82, 255, 0.15)',
        'inner-glow': 'inset 0px 4px 30px 0px #3a3a3c',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'subtle-pulse': 'subtlePulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        subtlePulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
