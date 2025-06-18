import React, { useState } from 'react';
import { cn } from '../lib/utils';

export interface LayoutProps {
  sidebar: React.ReactNode;
  header?: React.ReactNode;
  children: React.ReactNode;
}

export function Layout({ sidebar, header, children }: LayoutProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen flex">
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/60 md:hidden',
          open ? 'block' : 'hidden'
        )}
        onClick={() => setOpen(false)}
      />
      <aside
        className={cn(
          'fixed z-50 inset-y-0 left-0 w-64 bg-surface border-r transform md:static md:translate-x-0 transition-transform',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebar}
      </aside>
      <div className="flex-1 flex flex-col md:ml-64">
        <header className="h-14 flex items-center justify-between bg-white border-b px-4 md:ml-0">
          <button className="md:hidden mr-2 p-2" onClick={() => setOpen(true)}>
            <span className="sr-only">Open sidebar</span>☰
          </button>
          {header}
        </header>
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}

export default Layout;
