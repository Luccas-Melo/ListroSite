/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brandGreen: {
          50: '#f7fee0',
          100: '#e9ffb3',
          200: '#d9ff66',
          300: '#caff3a',
          400: '#b6e62a',
          500: '#8dbf1f',
          600: '#679a1a',
          700: '#436d10',
          800: '#2a4a0a',
          900: '#162b05',
        },
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-in-out',
      },
    },
  },
  plugins: [],
};
