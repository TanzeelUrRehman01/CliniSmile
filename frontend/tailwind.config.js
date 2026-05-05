export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1A6B9A', light: '#2389C8', dark: '#145580' },
        secondary: { DEFAULT: '#2E8B6F', light: '#38A882', dark: '#236B55' },
        accent: '#F0F7FB',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      boxShadow: {
        card: '0 2px 16px rgba(26,107,154,0.10)',
        hover: '0 8px 32px rgba(26,107,154,0.18)',
      },
    },
  },
  plugins: [],
}