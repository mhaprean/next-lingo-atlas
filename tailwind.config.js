/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // enables class-based dark mode toggling
  content: [
    './app/**/*.{js,ts,jsx,tsx}',    // adjust according to your folder structure
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './node_modules/@neondatabase/neon-js/ui/tailwind/**/*.js', // if you want neon-ui styles included
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
