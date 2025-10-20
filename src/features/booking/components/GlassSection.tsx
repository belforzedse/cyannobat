'use client';

import clsx from 'clsx';
import { type HTMLAttributes } from 'react';

const glassSectionClasses =
  'rounded-2xl sm:rounded-3xl border border-white/25 bg-white/45 p-4 sm:p-5 lg:p-6 shadow-[0_18px_40px_-28px_rgba(31,38,135,0.3)] backdrop-blur-sm ' +
  'dark:border-slate-800/70 dark:bg-slate-900/80 dark:shadow-[0_20px_50px_-30px_rgba(8,18,40,0.65)]';

type GlassSectionProps = HTMLAttributes<HTMLDivElement>;

const GlassSection = ({ className, ...props }: GlassSectionProps) => (
  <div className={clsx(glassSectionClasses, className)} {...props} />
);

export { glassSectionClasses };
export default GlassSection;
