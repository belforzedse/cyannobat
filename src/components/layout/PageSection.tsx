import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PageSectionElement = 'div' | 'main' | 'footer';

type PageSectionProps = {
  as?: PageSectionElement;
  children: ReactNode;
  className?: string;
};

const BASE_SECTION_STYLES =
  'relative mx-auto flex w-full max-w-6xl flex-col px-6 pb-24 pt-10 sm:px-10 lg:max-w-6xl lg:px-16 lg:pb-16 lg:pr-[8.5rem] xl:max-w-7xl xl:pr-[10rem] 2xl:max-w-7xl 2xl:pr-[11.5rem]';

const PageSection = ({ as: Component = 'div', children, className }: PageSectionProps) => {
  return <Component className={cn(BASE_SECTION_STYLES, className)}>{children}</Component>;
};

export default PageSection;
