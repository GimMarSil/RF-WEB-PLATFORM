import type { Config } from 'tailwindcss';

const darkMode: Config['darkMode'] = 'class';

const config: Config = {
  darkMode,
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#933037',
        'brand-light': '#F3E9E8',
        'brand-gray': '#878986',
        'brand-dark': '#363B38',
        surface: '#F9FAFB',
        border: '#E5E7EB',
        success: '#3EB489',
        info: '#1E90FF',
        warning: '#FACC15',
        error: '#EF4444',
        muted: '#6B7280',
        text: '#1F2937'
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif']
      }
    }
  }
};

export default config;
