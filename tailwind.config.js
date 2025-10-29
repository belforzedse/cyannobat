import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./src/**/*.{js,ts,jsx,tsx}', './styles/**/*.{css,scss}'],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--bg-rgb) / <alpha-value>)',
        foreground: 'rgb(var(--fg-rgb) / <alpha-value>)',
        muted: {
          DEFAULT: 'rgb(var(--muted-rgb) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground-rgb) / <alpha-value>)',
        },
        card: 'rgb(var(--card-rgb) / <alpha-value>)',
        border: 'rgb(var(--border-rgb) / <alpha-value>)',
        accent: {
          DEFAULT: 'rgb(var(--accent-rgb) / <alpha-value>)',
          foreground: 'rgb(var(--accent-foreground-rgb) / <alpha-value>)',
        },
        'accent-strong': 'rgb(var(--accent-strong-rgb) / <alpha-value>)',
        ring: 'rgb(var(--ring-rgb) / <alpha-value>)',
      },
      borderRadius: {
        '4xl': 'var(--radius-4xl)',
        '3xl': 'var(--radius-3xl)',
        glass: 'var(--radius-glass)',
        surface: 'var(--radius-surface)',
        chip: 'var(--radius-chip)',
        pill: 'var(--radius-pill)',
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
      },
      boxShadow: {
        glass: 'var(--shadow-glass)',
        'glass-soft': 'var(--shadow-glass-soft)',
        'glass-strong': 'var(--shadow-glass-strong)',
        primary: 'var(--shadow-primary)',
      },
      backdropBlur: {
        glass: '20px',
      },
      fontFamily: {
        vazir: ['var(--font-vazirmatn)', 'sans-serif'],
      },
      spacing: {
        'glass-xs': 'var(--space-glass-xs)',
        'glass-sm': 'var(--space-glass-sm)',
        'glass-md': 'var(--space-glass-md)',
        'glass-lg': 'var(--space-glass-lg)',
        'section-gap': 'var(--space-section-gap)',
      },
      transitionTimingFunction: {
        glass: 'var(--ease-glass)',
        'glass-emphasized': 'var(--ease-glass-emphasized)',
        'glass-soft': 'var(--ease-glass-soft)',
      },
    },
  },
  plugins: [animate],
};

export default config;
