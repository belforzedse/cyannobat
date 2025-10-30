import type { ReactNode } from 'react'
import '@styles/tokens.css'
import '@styles/reset.css'

import { ToastProvider } from '@/components/ui'

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang='fa' dir='rtl' suppressHydrationWarning>
      <body className='relative min-h-screen overflow-x-hidden bg-background text-foreground'>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}

export default RootLayout
