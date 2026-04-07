/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aura: {
          primary: '#C26A43',
          primaryHover: '#A85734',
          bg: '#F4EFEA',
          card: '#FFFFFF',
          textPrimary: '#2E2E2E',
          textSecondary: '#7A7A7A',
          border: '#E8E2DC',
          accentBg: '#FFF7F3'
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}
