/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'romantic': {
          50: '#fef5f7',
          100: '#fce7ed',
          200: '#fbd4e0',
          300: '#f7b0c8',
          400: '#f280a6',
          500: '#e85a87',
          600: '#d43768',
          700: '#b32851',
          800: '#952446',
          900: '#7d223f',
        },
        'pastel': {
          pink: '#ffc0cb',
          lavender: '#e6e6fa',
          peach: '#ffdab9',
          mint: '#f0fff0',
          cream: '#fffacd',
        }
      },
      fontFamily: {
        'elegant': ['Playfair Display', 'serif'],
        'modern': ['Poppins', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
