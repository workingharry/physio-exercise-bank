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
        clinical: {
          navy: '#0f172a',
          blue: '#1e3a8a',
          teal: '#0d9488',
          tealLight: '#14b8a6',
          slate: '#334155',
          ice: '#f0fdfa',
          cardDark: '#1e293b',
          cardLight: '#ffffff',
          borderDark: '#334155',
          borderLight: '#e2e8f0'
        }
      }
    },
  },
  plugins: [],
}
