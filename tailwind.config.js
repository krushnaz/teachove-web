/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        blue: {
          50: '#f0f2fa',
          100: '#e2e5f5',
          200: '#c7ceeb',
          300: '#a2addb',
          400: '#7585c7',
          500: '#2F3C7E', // Primary brand color
          600: '#2F3C7E', // Mapped blue-600
          700: '#202958', // Hover shade
          800: '#171e42',
          900: '#0f132b',
        },
        indigo: {
          50: '#f0f2fa',
          100: '#e2e5f5',
          200: '#c7ceeb',
          300: '#a2addb',
          400: '#7585c7',
          500: '#2F3C7E', // Primary brand color
          600: '#2F3C7E', // Mapped indigo-600
          700: '#202958', // Hover shade
          800: '#171e42',
          900: '#0f132b',
        },
        primary: {
          50: '#f0f2fa',
          100: '#e2e5f5',
          200: '#c7ceeb',
          300: '#a2addb',
          400: '#7585c7',
          500: '#2F3C7E', // Primary brand color
          600: '#2F3C7E',
          700: '#202958',
          800: '#171e42',
          900: '#0f132b',
        }
      }
    },
  },
  plugins: [],
}
