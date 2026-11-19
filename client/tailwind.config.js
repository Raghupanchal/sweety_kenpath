/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary: Soft Royal Periwinkle / Lavender Violet (from reference aesthetic)
        primary: {
          DEFAULT: '#6C5DD3',
          hover: '#5B4DC7',
          active: '#4E40B5',
          light: '#F0EEFD',
          border: '#DDD8FB',
        },
        // Secondary: Deep Midnight Navy
        secondary: {
          DEFAULT: '#05193C',
          hover: '#0A2656',
          active: '#04132E',
          muted: '#1E2D4A',
          subtle: '#E2E8F0',
        },
        // Refined soft lavender & periwinkle palette
        brand: {
          50: '#F8F7FF',
          100: '#F0EEFD',
          200: '#E1DCFA',
          300: '#C4BAF6',
          400: '#9887EE',
          500: '#6C5DD3',
          600: '#5B4DC7',
          700: '#4E40B5',
          800: '#3F3398',
          900: '#1E1B4B',
        },
        lavender: {
          50: '#F7F6FE',
          100: '#F0EEFD',
          200: '#E4E0FD',
          300: '#DDD8FB',
          400: '#B8ACF6',
          500: '#6C5DD3',
          600: '#5B4DC7',
        },
        navy: {
          50: '#F0F3F9',
          100: '#E2E8F2',
          500: '#1C3D7A',
          800: '#0B234F',
          900: '#05193C',
        },
        glucose: {
          low: '#F59E0B',       // <70 mg/dl (Hypoglycemia alert in warm amber)
          normal: '#10B981',    // 70 - 140 mg/dl (In target emerald)
          elevated: '#F97316',  // 141 - 180 mg/dl (Elevated orange)
          high: '#EF4444',      // >180 mg/dl (Hyperglycemia coral red)
        }
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(108, 93, 211, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
        'soft-lg': '0 12px 32px -4px rgba(108, 93, 211, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04)',
        'primary-glow': '0 4px 16px 0 rgba(108, 93, 211, 0.28)',
        'secondary-glow': '0 4px 14px 0 rgba(5, 25, 60, 0.2)',
      }
    },
  },
  plugins: [],
}
