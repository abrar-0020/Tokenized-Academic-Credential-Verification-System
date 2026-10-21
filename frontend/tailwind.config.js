/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        xs: '420px',
      },
      colors: {
        phantom: {
          bg: '#F5F2FF',      // color-4
          surface: '#E2DFFE', // color-3
          text: '#3C315B',    // color-1
          dark: '#AB9FF2',    // color-2
          light: '#FFFDF8',   // color-5
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        cormorant: ['Cormorant Garamond', 'Georgia', 'serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '10px',
        '4': '12px',
        '5': '16px',
        '6': '20px',
        '7': '24px',
        '8': '32px',
        '9': '48px',
        '10': '64px',
        '11': '76px',
        '12': '96px',
        '13': '120px',
        '14': '128px',
        '15': '395px',
      },
      borderRadius: {
        'sm': '24px',
        'md': '32px',
        'xl': '96px',
        'full': '100px',
        'circle': '50%',
      },
      fontSize: {
        'xs': '13px',
        'sm': '16px',
        'base': '20px',
        'lg': '24px',
        'xl': '85px',
        '2xl': '96px',
      },
      transitionDuration: {
        'fast': '150ms', 
        'slow': '400ms',
      },
      transitionTimingFunction: {
        'phantom': 'cubic-bezier(0.22, 1, 0.36, 1)',
      }
    },
  },
  plugins: [],
}
