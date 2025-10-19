import type { ReactNode } from 'react'

import ThemeProvider from '@/components/ThemeProvider'

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider>
      <div className='relative flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-background/95 px-4 py-12 sm:px-6'>
        <div className='pointer-events-none absolute inset-0 -z-10 overflow-hidden'>
          <div
            className='absolute -top-32 right-16 h-[22rem] w-[22rem] rounded-full bg-accent/25 blur-3xl dark:bg-accent/35'
            aria-hidden
          />
          <div
            className='absolute -bottom-40 left-10 h-[20rem] w-[20rem] rounded-full bg-accent-strong/20 blur-[120px] dark:bg-accent-strong/30'
            aria-hidden
          />
          <div
            className='absolute inset-x-12 top-12 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-70 dark:via-white/15'
            aria-hidden
          />
        </div>
        <div className='glass glass-fallback relative w-full max-w-lg rounded-[2rem] px-8 py-10 text-right shadow-2xl sm:px-12'>
          {children}
        </div>
      </div>
    </ThemeProvider>
  )
}

export default AuthLayout
