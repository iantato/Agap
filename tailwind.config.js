/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        aura: {
          black: '#0B0E14',
          dark: '#151923',
          card: '#1C2230',
          hover: '#2A3245',
          primary: '#3B82F6',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          text: {
            primary: '#F9FAFB',
            secondary: '#9CA3AF',
            muted: '#6B7280'
          }
        }
      },
      boxShadow: {
        'glow-green': '0 0 10px rgba(16, 185, 129, 0.5)',
        'glow-red': '0 0 10px rgba(239, 68, 68, 0.5)',
      }
    },
  },
  plugins: [],
}
