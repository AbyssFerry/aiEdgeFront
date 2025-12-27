/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        dark: '#1E293B',
        light: '#F8FAFC',
        danger: '#EF4444',
        warning: '#F59E0B',
        info: '#06B6D4',
      },
    },
  },
  plugins: [],
}
