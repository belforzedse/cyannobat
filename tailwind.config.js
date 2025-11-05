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
        destructive: {
          DEFAULT: 'rgb(var(--destructive-rgb) / <alpha-value>)',
          foreground: 'rgb(var(--destructive-foreground-rgb) / <alpha-value>)',
        },
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
      backdropSaturate: {
        30: '.3',
      },
      fontFamily: {
        vazir: ['var(--font-vazirmatn)', 'sans-serif'],
        rokh: ['Rokh', 'sans-serif'],
      },
      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
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
      transitionDuration: {
        250: '250ms',
        260: '260ms',
        300: '300ms',
        350: '350ms',
        400: '400ms',
        500: '500ms',
      },
      opacity: {
        8: '0.08',
        12: '0.12',
        18: '0.18',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-in-up': {
          from: {
            opacity: '0',
            transform: 'translateY(20px) scale(0.95)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0) scale(1)',
          },
        },
        'fade-in-down': {
          from: {
            opacity: '0',
            transform: 'translateY(-20px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'slide-in-right': {
          from: {
            opacity: '0',
            transform: 'translateX(30px)',
          },
          to: {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        'liquid-morph': {
          '0%, 100%': {
            transform: 'translate(0, 0) scale(1) rotate(0deg)',
          },
          '25%': {
            transform: 'translate(30px, -40px) scale(1.1) rotate(10deg)',
          },
          '50%': {
            transform: 'translate(-20px, 30px) scale(0.95) rotate(-5deg)',
          },
          '75%': {
            transform: 'translate(40px, -20px) scale(1.05) rotate(15deg)',
          },
        },
        'field-message-in': {
          from: {
            opacity: '0',
            transform: 'translateY(-4px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'modal-overlay-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'modal-content-in': {
          from: {
            opacity: '0',
            transform: 'translate(-50%, calc(-50% + 12px))',
          },
          to: {
            opacity: '1',
            transform: 'translate(-50%, -50%)',
          },
        },
        'toast-enter': {
          from: {
            opacity: '0',
            transform: 'translate3d(0, 12px, 0)',
          },
          to: {
            opacity: '1',
            transform: 'translate3d(0, 0, 0)',
          },
        },
        'tooltip-slide-up': {
          from: {
            opacity: '0',
            transform: 'translateY(6px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'tooltip-slide-down': {
          from: {
            opacity: '0',
            transform: 'translateY(-6px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'tooltip-slide-left': {
          from: {
            opacity: '0',
            transform: 'translateX(6px)',
          },
          to: {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        'tooltip-slide-right': {
          from: {
            opacity: '0',
            transform: 'translateX(-6px)',
          },
          to: {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-in-up': 'fade-in-up 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'fade-in-down': 'fade-in-down 0.4s ease-out',
        'slide-in-right': 'slide-in-right 0.4s ease-out',
        'liquid-morph': 'liquid-morph 6s ease-in-out infinite',
        'field-message-in': 'field-message-in 0.2s ease-glass',
        'modal-overlay-in': 'modal-overlay-in 0.22s ease-glass',
        'modal-content-in': 'modal-content-in 0.26s ease-glass',
        'toast-enter': 'toast-enter 0.22s ease-glass both',
        'tooltip-slide-up': 'tooltip-slide-up 0.18s ease-glass',
        'tooltip-slide-down': 'tooltip-slide-down 0.18s ease-glass',
        'tooltip-slide-left': 'tooltip-slide-left 0.18s ease-glass',
        'tooltip-slide-right': 'tooltip-slide-right 0.18s ease-glass',
      },
    },
  },
  plugins: [animate],
};

export default config;
