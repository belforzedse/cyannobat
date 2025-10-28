import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./src/**/*.{js,ts,jsx,tsx}', './styles/**/*.{css,scss}'],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--bg) / <alpha-value>)',
        foreground: 'rgb(var(--fg) / <alpha-value>)',
        muted: {
          DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
        },
        card: 'rgb(var(--card) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          foreground: 'rgb(var(--fg) / <alpha-value>)',
        },
        'accent-strong': 'rgb(var(--accent-strong) / <alpha-value>)',
      },
      borderRadius: {
        '3xl': '1.75rem',
        '4xl': '2rem',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        glass: '0 30px 80px -35px rgba(15, 23, 42, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.45)',
        'btn-primary': '0 20px 48px -24px rgba(86, 154, 222, 0.45), 0 10px 18px -16px rgba(42, 74, 125, 0.28)',
        'btn-primary-hover': '0 28px 60px -24px rgba(86, 154, 222, 0.55), 0 16px 24px -18px rgba(42, 74, 125, 0.34)',
        'btn-primary-dark': '0 24px 56px -26px rgba(36, 132, 255, 0.55), 0 12px 28px -18px rgba(2, 6, 28, 0.6)',
        'btn-primary-dark-hover': '0 32px 68px -28px rgba(120, 190, 255, 0.6), 0 18px 36px -20px rgba(2, 6, 28, 0.65)',
        'btn-secondary': '0 16px 36px -24px rgba(42, 74, 125, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.55)',
        'btn-secondary-hover': '0 20px 44px -26px rgba(86, 154, 222, 0.32), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        'btn-secondary-dark': '0 22px 48px -28px rgba(2, 6, 28, 0.72), inset 0 1px 0 rgba(120, 190, 255, 0.18)',
        'btn-secondary-dark-hover': '0 30px 58px -30px rgba(36, 132, 255, 0.32), inset 0 1px 0 rgba(120, 190, 255, 0.22)',
      },
      backdropBlur: {
        glass: '20px',
      },
      fontFamily: {
        vazir: ['var(--font-vazirmatn)', 'sans-serif'],
      },
    },
  },
  plugins: [animate],
};

export default config;
