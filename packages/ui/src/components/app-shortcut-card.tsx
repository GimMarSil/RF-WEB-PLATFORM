import { ReactNode, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Card } from './card';
import { cn } from '../lib/utils';
import { gsap } from 'gsap';

export interface AppShortcutCardProps {
  title: string;
  icon: ReactNode;
  href: string;
  className?: string;
}

export function AppShortcutCard({ title, icon, href, className }: AppShortcutCardProps) {
  const ref = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(ref.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0 });
    }
  }, []);

  return (
    <Link href={href} ref={ref} className={cn('block h-full', className)}>
      <Card className="flex flex-col items-center justify-center gap-2 p-4 text-center hover:bg-accent transition-colors h-full">
        <span className="text-2xl">{icon}</span>
        <span className="font-medium">{title}</span>
      </Card>
    </Link>
  );
}
