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
          50: '#F5F5FE',
          100: '#EBEBFE',
          200: '#D7D6FD',
          300: '#B8B5FB',
          400: '#948FF8',
          500: '#7C75F7',
          600: '#6C5DD3',
          700: '#5849BD',
          800: '#473AA3',
          900: '#3A3084',
        },
        surface: {
          light: '#F8F9FE',
          card: '#FFFFFF',
          muted: '#F1F3FA',
        },
        glucose: {
          low: '#FFB800',       // <70 mg/dl (Hypoglycemia alert)
          normal: '#10B981',    // 70 - 140 mg/dl (Normal target)
          elevated: '#F97316',  // 141 - 180 mg/dl (Elevated)
          high: '#EF4444',      // >180 mg/dl (Hyperglycemia alert)
        }
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
      boxShadow: {
        'soft': '0 10px 30px -5px rgba(108, 93, 211, 0.08), 0 4px 12px -2px rgba(108, 93, 211, 0.04)',
        'soft-lg': '0 20px 40px -10px rgba(108, 93, 211, 0.15), 0 8px 16px -4px rgba(108, 93, 211, 0.06)',
        'glow': '0 0 25px rgba(124, 117, 247, 0.35)',
      }
    },
  },
  plugins: [],
}
