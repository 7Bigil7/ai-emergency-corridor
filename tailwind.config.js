/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#07080A',
        surface: {
          DEFAULT: '#0E1013',
          elevated: '#15181E',
          glass: 'rgba(14, 16, 19, 0.75)',
        },
        border: {
          subtle: 'rgba(255, 255, 255, 0.08)',
          glow: 'rgba(43, 217, 124, 0.3)',
          alert: 'rgba(255, 59, 48, 0.4)',
        },
        emergency: {
          DEFAULT: '#FF3B30',
          glow: 'rgba(255, 59, 48, 0.25)',
          muted: '#8A201A',
        },
        corridor: {
          DEFAULT: '#2BD97C',
          glow: 'rgba(43, 217, 124, 0.25)',
          muted: '#175E38',
        },
        amber: {
          DEFAULT: '#FFB020',
          glow: 'rgba(255, 176, 32, 0.25)',
        },
        content: {
          primary: '#F2F4F7',
          secondary: '#8A919E',
          tertiary: '#505662',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        banner: ['"Barlow Condensed"', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'corridor-flow': 'corridorFlow 2s linear infinite',
      },
      keyframes: {
        corridorFlow: {
          '0%': { strokeDashoffset: '20' },
          '100%': { strokeDashoffset: '0' },
        }
      }
    },
  },
  plugins: [],
}