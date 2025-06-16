import React from 'react';
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';

export interface NavItem {
  href: string;
  label: string;
}

export interface LayoutProps {
  children: React.ReactNode;
  navItems?: NavItem[];
}

export default function Layout({ children, navItems = [] }: LayoutProps) {
  return (
    <div className="flex h-screen">
      <aside className="w-60 shrink-0 border-r border-border bg-surface p-4">
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded px-3 py-2 text-sm hover:bg-muted"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <h1 className="text-lg font-semibold">RF Web</h1>
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  );
}
