"use client";

const Sidebar = () => {
  return (
    <aside className="fixed right-4 top-20 h-[calc(100vh-144px)] w-20 flex-shrink-0 glass rounded-3xl flex flex-col items-center py-6 gap-4 z-40">
      {/* Sidebar icons/content go here */}
      <div className="w-12 h-12 rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors cursor-pointer" />
      <div className="w-12 h-12 rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors cursor-pointer" />
      <div className="w-12 h-12 rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors cursor-pointer" />
    </aside>
  );
};

export default Sidebar;
