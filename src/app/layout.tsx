import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Vazirmatn } from 'next/font/google';
import ThemeProvider from '@/components/ThemeProvider';
import '@styles/globals.css';

const vazirmatn = Vazirmatn({
  variable: '--font-vazirmatn',
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'سایان نوبت | cyannobat',
  description: 'رزرو نوبت سریع، ساده و شفاف',
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={`${vazirmatn.variable} font-vazir relative min-h-screen overflow-x-hidden bg-background text-foreground`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
