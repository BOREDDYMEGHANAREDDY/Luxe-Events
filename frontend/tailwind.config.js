/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#fdf9e7',
          100: '#fbf0c0',
          200: '#f6e07a',
          300: '#f0c93a',
          400: '#e8b118',
          500: '#B8960C',
          600: '#9a7a08',
          700: '#7a5f07',
          800: '#5c4808',
          900: '#3d2f06',
        },
        luxe: {
          black: '#0a0a0a',
          dark:  '#111111',
          card:  '#1a1a1a',
          border: '#2a2a2a',
          muted: '#888888',
        }
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in':    'fadeIn 0.6s ease-out',
        'slide-up':   'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'shimmer':    'shimmer 2s linear infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'float':      'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(30px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideDown: { from: { opacity: 0, transform: 'translateY(-10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        pulseGold: { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.6 } },
        float:     { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        'gold':     '0 0 20px rgba(184,150,12,0.3)',
        'gold-lg':  '0 0 40px rgba(184,150,12,0.4)',
        'glass':    '0 8px 32px rgba(0,0,0,0.4)',
        'luxury':   '0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(184,150,12,0.1)',
      },
      backgroundImage: {
        'gold-gradient':   'linear-gradient(135deg, #B8960C 0%, #f0c93a 50%, #B8960C 100%)',
        'dark-gradient':   'linear-gradient(180deg, #0a0a0a 0%, #111111 100%)',
        'glass-gradient':  'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      }
    }
  },
  plugins: []
};
