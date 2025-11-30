/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FBF8F1',
          100: '#F7F0E0',
          200: '#EFE1C1',
          300: '#E5CE99',
          400: '#D4AF37', // Primary gold
          500: '#C9A227',
          600: '#B8960C',
          700: '#967A0A',
          800: '#7A6308',
          900: '#5E4C06',
        },
        cream: {
          50: '#FFFEFB',
          100: '#FFFDF7',
          200: '#FFFBEF',
          300: '#FFF9E7',
          400: '#FFF5D7',
        },
        charcoal: {
          50: '#F5F5F5',
          100: '#E5E5E5',
          200: '#CCCCCC',
          300: '#999999',
          400: '#666666',
          500: '#333333',
          600: '#2A2A2A',
          700: '#1F1F1F',
          800: '#141414',
          900: '#0A0A0A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      animation: {
        'curtain-left': 'curtainLeft 1.5s ease-out forwards',
        'curtain-right': 'curtainRight 1.5s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'slide-down': 'slideDown 0.3s ease-out forwards',
        'zoom-in': 'zoomIn 0.3s ease-out forwards',
        'pulse-gold': 'pulseGold 2s infinite',
      },
      keyframes: {
        curtainLeft: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        curtainRight: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        zoomIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(212, 175, 55, 0)' },
        },
      },
      boxShadow: {
        'gold': '0 4px 14px 0 rgba(212, 175, 55, 0.25)',
        'gold-lg': '0 10px 40px 0 rgba(212, 175, 55, 0.3)',
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #F7E98E 50%, #D4AF37 100%)',
        'gradient-dark': 'linear-gradient(180deg, #1F1F1F 0%, #0A0A0A 100%)',
      },
    },
  },
  plugins: [],
}
