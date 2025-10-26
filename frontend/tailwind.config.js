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
        frost: '#e5f0ff',
        midnight: '#101522',
        sky: '#7fd1ff',
      },
      backdropBlur: {
        glass: '20px',
      },
      boxShadow: {
        glass: '0 20px 45px rgba(15, 35, 95, 0.15)',
      },
    },
  },
  plugins: [],
};
