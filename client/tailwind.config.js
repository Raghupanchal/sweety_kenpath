/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        glucose: {
          low: '#f59e0b',       // <70 mg/dl (Hypoglycemia alert)
          normal: '#10b981',    // 70 - 140 mg/dl (Normal target)
          elevated: '#f97316',  // 141 - 180 mg/dl (Elevated)
          high: '#ef4444',      // >180 mg/dl (Hyperglycemia alert)
        }
      }
    },
  },
  plugins: [],
}
