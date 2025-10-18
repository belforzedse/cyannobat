import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Logo from '@/components/Logo';

type BlobState = {
  x: number;
  y: number;
  rotate: number;
  scale: number;
};

type BlobStatePartial = Partial<BlobState>;

type FloatingBlobConfig = {
  className: string;
  animation: {
    initial?: BlobStatePartial;
    drift?: BlobStatePartial;
  };
  delay: number;
};

const defaultBlobState: BlobState = {
  x: 0,
  y: 0,
  rotate: 0,
  scale: 1,
};

const createKeyframes = (value: number, amplitude: number) => {
  if (Math.abs(amplitude) < 0.001) {
    return [value];
  }

  return [value, value + amplitude, value - amplitude * 0.75, value];
};

const floatingBlobVariants = (
  prefersReducedMotion: boolean,
  { initial, drift }: FloatingBlobConfig['animation'],
) => {
  const base = {
    ...defaultBlobState,
    ...initial,
  } satisfies BlobState;

  if (prefersReducedMotion) {
    return {
      initial: base,
      animate: base,
    };
  }

  const driftState = {
    x: 0,
    y: 0,
    rotate: 0,
    scale: 0,
    ...drift,
  } satisfies BlobState;

  return {
    initial: base,
    animate: {
      x: createKeyframes(base.x, driftState.x),
      y: createKeyframes(base.y, driftState.y),
      rotate: createKeyframes(base.rotate, driftState.rotate),
      scale: createKeyframes(base.scale, driftState.scale),
    },
  };
};

const floatingBlobTransition = {
  duration: 24,
  repeat: Infinity,
  repeatType: 'mirror' as const,
  ease: 'easeInOut' as const,
};

const floatingBlobConfigs: FloatingBlobConfig[] = [
  {
    className:
      'pointer-events-none absolute -left-24 top-24 hidden h-[28rem] w-[28rem] -translate-y-12 rounded-full bg-accent/25 blur-3xl sm:block -z-10 dark:bg-accent/30',
    animation: {
      initial: { x: -40, y: -32, rotate: -6, scale: 1.05 },
      drift: { x: 24, y: 20, rotate: 10, scale: 0.08 },
    },
    delay: 0,
  },
  {
    className:
      'pointer-events-none absolute -right-32 bottom-16 h-[26rem] w-[26rem] rounded-full bg-accent-strong/20 blur-[140px] -z-10 dark:bg-accent-strong/35',
    animation: {
      initial: { x: 32, y: 24, rotate: 4, scale: 0.95 },
      drift: { x: -28, y: -30, rotate: -8, scale: 0.12 },
    },
    delay: 6,
  },
  {
    className:
      'pointer-events-none absolute inset-x-8 top-6 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-60 -z-10 dark:via-white/15',
    animation: {
      initial: { y: 0, rotate: 0, scale: 1 },
      drift: { y: 10, rotate: 0, scale: 0.02 },
    },
    delay: 3,
  },
];

const SiteLayout = ({ children }: { children: ReactNode }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative flex min-h-screen w-full">
      <Logo />
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex min-h-screen flex-1 flex-col">
        <Header />
        {floatingBlobConfigs.map(({ className, animation, delay }) => {
          const { initial, animate } = floatingBlobVariants(
            prefersReducedMotion,
            animation,
          );

          return (
            <motion.div
              key={className}
              className={className}
              aria-hidden
              initial={initial}
              animate={animate}
              transition={{ ...floatingBlobTransition, delay }}
            />
          );
        })}
        <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-32 pt-8 sm:px-10 lg:px-12 lg:pb-16 lg:pr-[7.5rem] xl:pr-[9rem] 2xl:pr-[10.5rem]">
          {children}
        </main>
        <footer className="relative mx-auto flex w-full max-w-6xl flex-col items-end gap-1 px-6 pb-32 pt-8 text-right text-sm text-muted sm:px-10 lg:px-12 lg:pb-16 lg:pr-[7.5rem] xl:pr-[9rem] 2xl:pr-[10.5rem]">
          <span>© {new Date().getFullYear()} سایان نوبت — cyannobat</span>
          <span>همراه شما برای تجربه‌ای متفاوت در رزرو آنلاین.</span>
        </footer>
      </div>
    </div>
  );
};

export default SiteLayout;
