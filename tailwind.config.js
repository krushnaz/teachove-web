/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f2ff',
          100: '#e0e5ff',
          200: '#c7d1ff',
          300: '#a5b4ff',
          400: '#7c8cff',
          500: '#2F3C7E', // Your primary color
          600: '#2a2f6b',
          700: '#232558',
          800: '#1e1f47',
          900: '#1a1a3a',
        }
      }
    },
  },
  plugins: [],
}
