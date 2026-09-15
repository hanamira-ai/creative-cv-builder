/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#182634',
        gold: '#C08A3E',
        sidebar: '#F4F6F8',
        'text-dark': '#2C3E50',
        'text-muted': '#6B7280',
      },
    },
  },
  plugins: [],
};
