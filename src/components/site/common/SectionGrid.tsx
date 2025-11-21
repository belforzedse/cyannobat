'use client';

import type { ReactNode } from 'react';
import clsx from 'clsx';

interface SectionGridProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'hero-steps';
}

/**
 * SectionGrid - Responsive grid layout for site sections
 * Provides consistent grid layouts for different section types
 */
export const SectionGrid = ({ children, className, variant = 'default' }: SectionGridProps) => {
  const variantClasses = {
    default: 'grid gap-6 lg:grid-cols-2',
    'hero-steps': 'grid gap-6 lg:grid-cols-[1fr_minmax(200px,500px)] lg:items-stretch',
  };

  return <div className={clsx(variantClasses[variant], className)}>{children}</div>;
};
