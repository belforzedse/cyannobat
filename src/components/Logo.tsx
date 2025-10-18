'use client';

import Image from 'next/image';

const Logo = () => {
  return (
    <div className="hidden lg:flex fixed top-4 right-4 h-[77px] w-24 items-center justify-center rounded-3xl p-4 bg-gradient-to-br from-white/65 via-accent/35 to-accent-strong/50 shadow-inner backdrop-blur-xl dark:from-white/15 dark:via-accent/25 dark:to-accent-strong/45 z-50">
      <Image
        src="/logo.png"
        alt="Logo"
        width={80}
        height={80}
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default Logo;
