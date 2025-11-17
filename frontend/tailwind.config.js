/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        charcoal: '#111111',
        graphite: '#1A1A1A',
        metallic: '#2D2D2D',
        'electric-blue': '#2BA8FF',
        'neon-yellow': '#F2FF49',
        'steel-gray': '#4A4A4A',
        'tech-white': '#E8E8E8',
        'success-green': '#00FF88',
        'warning-orange': '#FF6B2B',
        'error-red': '#FF2B5E',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'tech': '14px',
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(43, 168, 255, 0.4)',
        'glow-yellow': '0 0 15px rgba(242, 255, 73, 0.3)',
        'shadow-deep': '0 8px 32px rgba(0, 0, 0, 0.6)',
        'shadow-panel': '0 4px 16px rgba(0, 0, 0, 0.8)',
      },
      animation: {
        'pulse-blue': 'pulse-blue 2s infinite',
        'pulse-red': 'pulse-red 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
