import type { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  className?: string;
  variant?: 'card' | 'plain';
}

export function Section({
  children,
  className,
  variant = 'plain',
}: SectionProps) {
  const baseStyles = 'px-10 py-8';
  const variantStyles =
    variant === 'card'
      ? 'border border-gray-200 bg-white shadow-sm rounded-lg'
      : '';

  return (
    <section
      className={[baseStyles, variantStyles, className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </section>
  );
}
