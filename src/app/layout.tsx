import type { ReactNode } from 'react';

const RootLayout = ({ children }: { children: ReactNode }) => {
  return children as React.ReactElement;
};

export default RootLayout;
