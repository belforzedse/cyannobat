'use client';

import Image from 'next/image';

const Logo = () => {
  return (
    <div className="  lg:flex fixed  h-[72px]  w-[72px] lg:h-20 lg:w-20 items-center justify-center p-4 z-50 ">
      <Image
        src="/group 4.png"
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
