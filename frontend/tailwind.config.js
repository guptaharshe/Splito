/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': '#E4E4E7', // Zinc-200
        'bg-surface': '#FFFFFF',
        'bg-elevated': '#D4D4D8',
        'bg-input': '#F4F4F5',
        'border-subtle': '#E4E4E7',
        'border-default': '#D4D4D8',
        'border-focus': '#A1A1AA',
        'text-primary': '#18181B', // Zinc-900 (almost black)
        'text-secondary': '#52525B', // Zinc-600
        'text-tertiary': '#A1A1AA', // Zinc-400
        'text-inverse': '#FFFFFF',
        'accent': '#18181B', // Dark accent
        'accent-hover': '#27272A',
        'accent-subtle': 'rgba(24,24,27,0.05)',
        'success': '#16A34A',
        'success-subtle': 'rgba(22,163,74,0.1)',
        'warning': '#D97706',
        'warning-subtle': 'rgba(217,119,6,0.1)',
        'error': '#DC2626',
        'error-subtle': 'rgba(220,38,38,0.1)',
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
        'sm': '4px',
        'base': '8px',
        'md': '12px',
        'lg': '16px',
        'full': '9999px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0,0,0,0.05)',
        'md': '0 4px 12px rgba(0,0,0,0.06)',
        'lg': '0 12px 32px rgba(0,0,0,0.08)',
        'xl': '0 24px 48px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
};
