import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PageSectionElement = 'div' | 'main' | 'footer';

type PageSectionProps = {
  as?: PageSectionElement;
  children: ReactNode;
  className?: string;
};

const BASE_SECTION_STYLES =
  'relative flex w-full flex-col px-6 pb-32 pt-8 sm:px-10 lg:px-16 lg:pb-16 lg:pr-[8.5rem] xl:pr-[10rem] 2xl:pr-[11.5rem]';

const PageSection = ({ as: Component = 'div', children, className }: PageSectionProps) => {
  return <Component className={cn(BASE_SECTION_STYLES, className)}>{children}</Component>;
};

export default PageSection;
