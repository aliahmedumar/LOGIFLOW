import { Anchor } from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps extends LucideProps {
  iconOnly?: boolean;
}

export function Logo({ className, iconOnly = false, ...props }: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      <Anchor className={cn("h-7 w-7 text-primary", className)} {...props} />
      {!iconOnly && <span className="text-xl font-semibold text-primary font-headline">LogiFlow</span>}
    </div>
  );
}
