'use client';

import Image from 'next/image';

const Logo = () => {
  return (
    <div className="glass hidden lg:flex fixed top-4 right-4 h-[77px] w-24 items-center justify-center p-4 z-50 animate-fade-in">
      <Image
        src="/logo.png"
        alt="سایان نوبت - لوگو"
        width={80}
        height={80}
        className="w-full h-full object-contain"
        priority
      />
    </div>
  );
};

export default Logo;
