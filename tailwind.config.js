/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
       
        bg: {
          DEFAULT: '#0B0F1A',
          secondary: '#0F1525',
          tertiary: '#131929',
          card: '#111827',
        },
        
        border: {
          DEFAULT: 'rgba(255,255,255,0.08)',
          strong: 'rgba(255,255,255,0.14)',
          glow: 'rgba(99,102,241,0.4)',
        },
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
        },
        // Accent
        accent: {
          cyan: '#06B6D4',
          purple: '#A855F7',
          blue: '#3B82F6',
          emerald: '#10B981',
          rose: '#F43F5E',
          amber: '#F59E0B',
        },
        // Text
        text: {
          primary: '#F8FAFC',
          secondary: '#94A3B8',
          muted: '#475569',
          accent: '#818CF8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(99,102,241,0.25)',
        'glow-md': '0 0 30px rgba(99,102,241,0.35), 0 0 60px rgba(99,102,241,0.15)',
        'glow-lg': '0 0 50px rgba(99,102,241,0.4), 0 0 100px rgba(99,102,241,0.2)',
        'glow-cyan': '0 0 25px rgba(6,182,212,0.4)',
        'glow-purple': '0 0 25px rgba(168,85,247,0.4)',
        'card': '0 1px 3px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.3)',
        'card-hover': '0 4px 20px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.2), 0 0 30px rgba(99,102,241,0.1)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.05)',
        'btn': '0 1px 2px rgba(0,0,0,0.4), 0 4px 16px rgba(99,102,241,0.3)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
        'gradient-brand-h': 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)',
        'gradient-cyan': 'linear-gradient(135deg, #06B6D4 0%, #6366F1 100%)',
        'gradient-mesh': 'radial-gradient(at 40% 20%, rgba(99,102,241,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(168,85,247,0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(6,182,212,0.08) 0px, transparent 50%), radial-gradient(at 80% 50%, rgba(99,102,241,0.08) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(99,102,241,0.1) 0px, transparent 50%)',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-16px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: 0.6 },
          '50%': { opacity: 1 },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
}
