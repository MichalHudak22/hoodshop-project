/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Anton', 'sans-serif'], // 🧠 Pridaný font Anton
         body: ['system-ui', 'sans-serif'], // pre bežný text
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}
