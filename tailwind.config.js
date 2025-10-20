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
