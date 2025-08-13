import type { Config } from 'tailwindcss'

const config: Config = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // StreetTalk Purple Brand
        'street': {
          50: '#faf7ff',
          100: '#f3ecff',
          200: '#e8dcff',
          300: '#d4c2ff',
          400: '#b896ff',
          500: '#9b5cff',
          600: '#8b3dff',
          700: '#7c2bff',
          800: '#6b1fff',
          900: '#4b0082', // Main brand purple
          950: '#2d0050',
        },
        // Light/Street theme colors
        'light': {
          50: '#ffffff',   // Pure white
          100: '#fafafa',  // Off white
          200: '#f5f5f5',  // Light gray
          300: '#e5e5e5',  // Border gray
          400: '#a1a1a1',  // Muted text
          500: '#737373',  // Medium text
          600: '#525252',  // Dark text
          700: '#404040',  // Darker text
          800: '#262626',  // Almost black
          900: '#171717',  // Black text
        }
      },
      fontFamily: {
        // Street-style modern fonts
        'street': ['SF Pro Display', 'Inter', 'system-ui', 'sans-serif'],
        'street-mono': ['SF Mono', 'Monaco', 'Consolas', 'monospace'],
        'urban': ['Helvetica Neue', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'street-xs': ['11px', { lineHeight: '16px', letterSpacing: '0.025em' }],
        'street-sm': ['13px', { lineHeight: '18px', letterSpacing: '0.025em' }],
        'street-base': ['16px', { lineHeight: '24px', letterSpacing: '0.015em' }],
        'street-lg': ['20px', { lineHeight: '28px', letterSpacing: '0.015em' }],
        'street-xl': ['24px', { lineHeight: '32px', letterSpacing: '0.015em' }],
        'street-2xl': ['32px', { lineHeight: '40px', letterSpacing: '0.01em' }],
      },
    },
  },
  plugins: [],
}

export default config

