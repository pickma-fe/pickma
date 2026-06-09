import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  text: string;
  colorClass: string;
}

export function StatusBadge({ text, colorClass }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
        colorClass
      )}
    >
      {text}
    </span>
  );
}
