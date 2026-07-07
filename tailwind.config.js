/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spotnicik: {
          primary: '#0052CC',
          cyan: '#00D4FF',
          gold: '#FFB700',
          pink: '#FF006E',
          dark: '#0A1828',
          light: '#F5F5F5',
        },
      },
      fontFamily: {
        sans: ['Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
