import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import clsx from 'clsx';
import styles from './FrostedCard.module.css';

type FrostedCardTone = 'default' | 'muted';

type FrostedCardProps<T extends ElementType> = {
  as?: T;
  tone?: FrostedCardTone;
  hover?: boolean;
  padded?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'tone' | 'hover' | 'padded' | 'className' | 'children'>;

const FrostedCard = <T extends ElementType = 'div'>({
  as,
  tone = 'default',
  hover = true,
  padded = true,
  className,
  children,
  ...props
}: FrostedCardProps<T>) => {
  const Component = (as ?? 'div') as ElementType;

  return (
    <Component
      {...props}
      className={clsx(
        styles.card,
        padded && styles.padded,
        hover && styles.hoverable,
        tone === 'muted' && styles.toneMuted,
        className,
      )}
    >
      <div className={styles.content}>{children}</div>
    </Component>
  );
};

export default FrostedCard;
