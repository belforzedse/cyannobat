import animate from 'tailwindcss-animate';

const withOpacity = (variable) => ({ opacityValue }) => {
  if (opacityValue === undefined || opacityValue === null) {
    return `var(${variable})`;
  }

  const numericOpacity = Number(opacityValue);

  if (Number.isNaN(numericOpacity) || numericOpacity >= 1) {
    return `var(${variable})`;
  }

  return `color-mix(in srgb, var(${variable}) calc(${numericOpacity} * 100%), transparent)`;
};

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./src/**/*.{js,ts,jsx,tsx}', './styles/**/*.{css,scss}'],
  theme: {
    extend: {
      colors: {
        background: withOpacity('--bg'),
        foreground: withOpacity('--fg'),
        muted: {
          DEFAULT: withOpacity('--muted'),
          foreground: withOpacity('--muted-foreground'),
        },
        card: withOpacity('--card'),
        border: withOpacity('--border'),
        accent: {
          DEFAULT: withOpacity('--accent'),
          foreground: withOpacity('--fg'),
        },
        'accent-strong': withOpacity('--accent-strong'),
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
