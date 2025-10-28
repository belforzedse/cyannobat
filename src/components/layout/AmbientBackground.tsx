const AmbientBackground = () => {
  return (
    <>
      <div
        className="pointer-events-none absolute -left-24 top-24 hidden h-[28rem] w-[28rem] -translate-y-12 rounded-full bg-accent/25 blur-3xl sm:block -z-10 dark:bg-accent/30"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-32 bottom-16 h-[26rem] w-[26rem] rounded-full bg-accent-strong/20 blur-[140px] -z-10 dark:bg-accent-strong/35"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-8 top-6 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-60 -z-10 dark:via-white/15"
        aria-hidden
      />
    </>
  );
};

export default AmbientBackground;
