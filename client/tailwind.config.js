/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Logo Primary: Vibrant Medical Pink
        primary: {
          DEFAULT: '#FA0C57',
          hover: '#E00A4D',
          active: '#C70843',
          light: '#FFF0F5',
          border: '#FFE0EB',
        },
        // Logo Secondary: Deep Midnight Navy
        secondary: {
          DEFAULT: '#05193C',
          hover: '#0A2656',
          active: '#04132E',
          muted: '#1E2D4A',
          subtle: '#E8ECF4',
        },
        // Brand aliases for backward compatibility & easy utility use
        brand: {
          50: '#FFF0F5',
          100: '#FFE2EC',
          200: '#FFC5D9',
          300: '#FF96BB',
          400: '#FA4F8A',
          500: '#FA0C57',
          600: '#E00A4D',
          700: '#C70843',
          800: '#A30636',
          900: '#05193C',
        },
        navy: {
          50: '#F0F3F9',
          100: '#E2E8F2',
          500: '#1C3D7A',
          800: '#0B234F',
          900: '#05193C',
        },
        glucose: {
          low: '#FFB800',       // <70 mg/dl (Hypoglycemia alert)
          normal: '#10B981',    // 70 - 140 mg/dl (Normal target)
          elevated: '#F97316',  // 141 - 180 mg/dl (Elevated)
          high: '#FA0C57',      // >180 mg/dl (Hyperglycemia alert in brand pink)
        }
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
      boxShadow: {
        'soft': '0 10px 30px -5px rgba(5, 25, 60, 0.06), 0 4px 12px -2px rgba(5, 25, 60, 0.03)',
        'soft-lg': '0 20px 40px -10px rgba(5, 25, 60, 0.12), 0 8px 16px -4px rgba(5, 25, 60, 0.05)',
        'primary-glow': '0 8px 25px rgba(250, 12, 87, 0.35)',
        'secondary-glow': '0 8px 25px rgba(5, 25, 60, 0.35)',
      }
    },
  },
  plugins: [],
}
