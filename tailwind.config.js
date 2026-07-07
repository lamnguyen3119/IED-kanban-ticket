/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#d9e6ff',
          200: '#bcd3ff',
          300: '#8eb6ff',
          400: '#598dff',
          500: '#3366ff',
          600: '#1a47e6',
          700: '#1538b8',
          800: '#16309a',
          900: '#172e7a',
        },
        tcm: {
          sidebar: '#1b2430',
          sidebarActive: '#2a3950',
          sidebarText: '#94a3b8',
          sidebarTextActive: '#ffffff',
          bg: '#f4f6f8',
          card: '#ffffff',
          border: '#e2e8f0',
          muted: '#64748b',
          text: '#1e293b',
        },
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(15, 23, 42, 0.04), 0 1px 3px 0 rgba(15, 23, 42, 0.06)',
        cardHover: '0 4px 12px 0 rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};