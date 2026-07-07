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
          primary: '#0052CC',    // Azul principal
          cyan: '#00D4FF',       // Cyan vibrant
          gold: '#FFB700',       // Amarelo/Ouro
          pink: '#FF006E',       // Rosa/Magenta
          dark: '#0A1828',       // Azul escuro
          light: '#F5F5F5',      // Cinza claro
        },
      },
      fontFamily: {
        sans: ['Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
