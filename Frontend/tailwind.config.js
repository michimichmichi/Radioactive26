/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
       fontFamily: {
        avrile: ['AvrileSans', 'sans-serif'],
        blok: ['BlokFont', 'sans-serif'],
        boldfont: ['TheBoldFont', 'sans-serif'],
        bitcount: ["Bitcount Prop Double Ink", "sans-serif"],
    },
  },
  plugins: [],
}
}