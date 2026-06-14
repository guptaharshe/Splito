/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': '#0a0a0a',
        'bg-surface': '#111111',
        'bg-elevated': '#1a1a1a',
        'bg-input': '#141414',
        'border-subtle': '#222222',
        'border-default': '#2e2e2e',
        'border-focus': '#555555',
        'text-primary': '#f0f0f0',
        'text-secondary': '#888888',
        'text-tertiary': '#555555',
        'text-inverse': '#0a0a0a',
        'accent': '#4f7cff',
        'accent-hover': '#3d6aee',
        'accent-subtle': 'rgba(79,124,255,0.1)',
        'success': '#22c55e',
        'success-subtle': 'rgba(34,197,94,0.1)',
        'warning': '#f59e0b',
        'warning-subtle': 'rgba(245,158,11,0.1)',
        'error': '#ef4444',
        'error-subtle': 'rgba(239,68,68,0.1)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'xs': '11px',
        'sm': '13px',
        'base': '14px',
        'md': '16px',
        'lg': '20px',
        'xl': '28px',
        '2xl': '40px',
      },
      borderRadius: {
        'sm': '2px',
        'base': '4px',
        'md': '6px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0,0,0,0.4)',
        'md': '0 4px 12px rgba(0,0,0,0.5)',
        'lg': '0 8px 24px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
};
