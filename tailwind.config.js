/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pfand-green': '#00A859', // Vert allemand écologique
        'pfand-blue': '#0066CC',  // Bleu pour les infos
      }
    },
  },
  plugins: [],
}