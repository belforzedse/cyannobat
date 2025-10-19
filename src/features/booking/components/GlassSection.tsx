'use client';

import clsx from 'clsx';
import { type HTMLAttributes } from 'react';

const glassSectionClasses =
  'rounded-2xl sm:rounded-3xl border border-white/25 bg-white/45 p-4 sm:p-5 lg:p-6 shadow-[0_18px_40px_-28px_rgba(31,38,135,0.3)] backdrop-blur-sm dark:border-white/10 dark:bg-black/50';

type GlassSectionProps = HTMLAttributes<HTMLDivElement>;

const GlassSection = ({ className, ...props }: GlassSectionProps) => (
  <div className={clsx(glassSectionClasses, className)} {...props} />
);

export { glassSectionClasses };
export default GlassSection;
