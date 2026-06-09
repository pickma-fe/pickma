import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface AdminCardProps {
  title: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  contentClassName?: string;
}

export function AdminCard({
  title,
  action,
  children,
  contentClassName,
}: AdminCardProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        {action && <div>{action}</div>}
      </div>
      <div className={cn('px-5 py-4', contentClassName)}>{children}</div>
    </section>
  );
}
