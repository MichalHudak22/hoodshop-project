/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Lexend', 'sans-serif'], // pre nadpisy
        body: ['Lexend', 'sans-serif'], // pre bežný text
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}
