/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
      extend: {
        colors: {
          neonGreen: '#39ff14',
        },
        dropShadow: {
          neon: '0 0 10px #39ff14',
        },
        fontFamily: {
          mono: ['Courier New', 'monospace'],
        },
      },
    },
    plugins: [],
  };