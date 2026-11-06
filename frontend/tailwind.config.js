/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Smart Krushi Lush Emerald & Forest Green Palette
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22'
        },
        // Warm Harvest Golden Amber Palette
        harvest: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f'
        },
        // Modern Crisp Slate Neutrals
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617'
        },
        // Soil mapping for backwards compatibility
        soil: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a'
        },
        cream: '#fcfdfa'
      },
      fontFamily: {
        sans: ['"Inter"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', '"Inter"', 'sans-serif'],
      },
      boxShadow: {
        'saas': '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'saas-md': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'saas-lg': '0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
        'premium': '0 10px 30px -5px rgba(6, 78, 59, 0.08)',
        'premium-lg': '0 20px 50px -10px rgba(6, 78, 59, 0.12)',
        'card': '0 2px 8px -2px rgba(15, 23, 42, 0.06)',
        'card-hover': '0 15px 35px -8px rgba(6, 78, 59, 0.15)',
        'glow-brand': '0 0 25px -5px rgba(16, 185, 129, 0.35)',
        'glow-harvest': '0 0 25px -5px rgba(245, 158, 11, 0.35)',
        'glow-danger': '0 0 25px -5px rgba(239, 68, 68, 0.3)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.6)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem'
      },
      backgroundImage: {
        'gradient-mesh': 'radial-gradient(at 40% 20%, rgba(16,185,129,0.08) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(245,158,11,0.06) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(6,78,59,0.05) 0px, transparent 50%)',
        'hero-pattern': 'linear-gradient(135deg, #022c22 0%, #064e3b 30%, #047857 60%, #065f46 100%)',
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 5s 1s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
        'scan': 'scan 2s ease-in-out infinite',
        'scale-up': 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'fade-in-up': 'slideInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in-left': 'slideInLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in-right': 'slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'gradient': 'gradientShift 4s ease-in-out infinite',
        'glow': 'glowRing 2s ease-in-out infinite',
        'orbit': 'orbit 12s linear infinite',
        'orbit-reverse': 'orbitReverse 15s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        scan: {
          '0%, 100%': { transform: 'translateY(0%)' },
          '50%': { transform: 'translateY(100%)' }
        },
        scaleUp: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        },
        glowRing: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.35)' },
          '50%': { boxShadow: '0 0 0 6px rgba(16, 185, 129, 0)' }
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(60px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(60px) rotate(-360deg)' }
        },
        orbitReverse: {
          '0%': { transform: 'rotate(0deg) translateX(80px) rotate(0deg)' },
          '100%': { transform: 'rotate(-360deg) translateX(80px) rotate(360deg)' }
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' }
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        },
      }
    },
  },
  plugins: [],
}
