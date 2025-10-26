/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'media',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './pages/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
      },
      colors: {
        pearl: '#f7faff',
        blush: '#fdecef',
        lavender: '#e7e0ff',
        lilac: '#c7d2ff',
        mint: '#d7f5ef',
        sky: '#a5d8ff',
        midnight: '#101522',
      },
      backdropBlur: {
        glass: '20px',
      },
      boxShadow: {
        glass: '0 28px 60px -30px rgba(134, 154, 255, 0.45)',
      },
    },
  },
  plugins: [],
};
