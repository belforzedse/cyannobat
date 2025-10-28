import { cn } from '@/lib/utils'

import { glassPillClassName } from './glass'

export type ButtonVariant = 'primary' | 'secondary' | 'glass-pill'

const easing = 'ease-[cubic-bezier(0.16,1,0.3,1)]'

export const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary: cn(
    'relative inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 text-base font-semibold text-[#0c1626] dark:text-[#040a18]',
    'transform-gpu overflow-hidden border border-white/55 bg-[linear-gradient(135deg,_rgb(var(--accent-strong)),_rgb(var(--accent)))]',
    'shadow-btn-primary dark:shadow-btn-primary-dark backdrop-blur-[12px] filter transition-[transform,box-shadow,filter] duration-200',
    easing,
    "after:content-[''] after:absolute after:inset-[2px] after:rounded-[inherit] after:bg-[linear-gradient(180deg,_rgba(255,255,255,0.55)_0%,_rgba(255,255,255,0.2)_58%,_transparent_100%)]",
    'after:opacity-[0.85] after:pointer-events-none after:transition-opacity after:duration-200',
    'hover:-translate-y-px hover:shadow-btn-primary-hover hover:after:opacity-100 dark:hover:shadow-btn-primary-dark-hover',
    'active:translate-y-0 active:brightness-[0.98]',
    'disabled:cursor-not-allowed disabled:opacity-75 disabled:shadow-none disabled:bg-[linear-gradient(135deg,_rgb(var(--accent)_/_0.55),_rgb(var(--accent)_/_0.35))]',
    'disabled:after:opacity-50 disabled:filter-none disabled:transform-none',
    'dark:disabled:bg-[linear-gradient(135deg,_rgb(var(--accent)_/_0.42),_rgb(var(--accent)_/_0.24))]'
  ),
  secondary: cn(
    'relative inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-[0.9rem] font-medium text-foreground',
    'transform-gpu overflow-hidden border border-white/45 bg-[linear-gradient(145deg,_rgba(255,255,255,0.68),_rgba(255,255,255,0.4))]',
    'shadow-btn-secondary dark:shadow-btn-secondary-dark backdrop-blur-[14px] transition-[transform,box-shadow,border-color,background] duration-200',
    easing,
    "after:content-[''] after:absolute after:inset-[2px] after:rounded-[inherit] after:bg-[linear-gradient(180deg,_rgba(255,255,255,0.45)_0%,_rgba(255,255,255,0.12)_65%,_transparent_100%)]",
    'after:opacity-75 after:pointer-events-none after:transition-opacity after:duration-200',
    'hover:-translate-y-px hover:border-[rgb(var(--accent)_/_0.45)] hover:bg-[linear-gradient(145deg,_rgba(255,255,255,0.72),_rgba(var(--accent),_0.16))] hover:shadow-btn-secondary-hover hover:after:opacity-90',
    'dark:text-foreground dark:border-[rgba(120,190,255,0.28)] dark:bg-[linear-gradient(145deg,_rgba(12,22,38,0.85),_rgba(12,22,38,0.62))] dark:hover:border-[rgba(120,190,255,0.5)]',
    'dark:hover:bg-[linear-gradient(145deg,_rgba(36,132,255,0.18),_rgba(12,22,38,0.78))] dark:hover:shadow-btn-secondary-dark-hover',
    'active:translate-y-0',
    'disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none disabled:transform-none disabled:after:opacity-40',
    'dark:disabled:border-[rgba(120,190,255,0.16)] dark:disabled:bg-[linear-gradient(145deg,_rgba(12,22,38,0.7),_rgba(12,22,38,0.5))]'
  ),
  'glass-pill': glassPillClassName(
    cn(
      'inline-flex items-center justify-center gap-2 text-sm font-medium cursor-pointer',
      'transition-[transform,box-shadow,border-color,background] duration-200',
      easing
    )
  ),
}

export const getButtonVariantClass = (variant: ButtonVariant): string => buttonVariantClasses[variant]
