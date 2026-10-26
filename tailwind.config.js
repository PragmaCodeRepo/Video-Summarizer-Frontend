/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#09090B',
        panel: '#111318',
        card: '#14171D',
        border: '#272B35',
        primary: '#6366F1',
        secondary: '#818CF8',
        success: '#34D399',
        warning: '#FBBF24',
        danger: '#FB7185',
        text: '#F4F4F5',
        muted: '#A1A1AA',
      },
      boxShadow: {
        soft: '0 12px 40px rgba(15, 23, 42, 0.25)',
      },
      borderRadius: {
        xl: '1rem',
      },
    },
  },
  plugins: [],
};

