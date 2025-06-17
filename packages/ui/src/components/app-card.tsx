import { gsap } from "gsap";
import Link from "next/link";
import { Lock, type LucideIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { Card } from "./card";
import { cn } from "../lib/utils";

export interface AppCardProps {
  title: string;
  description: string;
  href: string;
  locked?: boolean;
  icon?: LucideIcon;
  className?: string;
}

export function AppCard({ title, description, href, locked, icon: Icon, className }: AppCardProps) {
  const ref = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(ref.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0 });
    }
  }, []);

  const content = (
    <Card className={cn("p-4 relative h-full", className)}>
      {Icon && <Icon className="w-8 h-8 mb-2 text-muted-foreground" />}
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      {locked && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-gray-800/60">
          <Lock className="h-6 w-6 text-white" />
        </div>
      )}
    </Card>
  );

  return locked ? (
    <div ref={ref}>{content}</div>
  ) : (
    <Link href={href} ref={ref} className="block h-full">
      {content}
    </Link>
  );
}
