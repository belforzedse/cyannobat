import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import ThemeProvider from '@/components/ThemeProvider';
import '@styles/globals.css';

export const metadata: Metadata = {
  title: 'سایان نوبت | cyannobat',
  description: 'رزرو نوبت سریع، ساده و شفاف',
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
