import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'style'
> {
  children: ReactNode;
  variant?: 'filled' | 'outline' | 'ghost';
  color?: 'primary' | 'danger' | 'gray';
}

const baseStyles =
  'inline-flex items-center justify-center rounded-sm border px-4 py-2 font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-200 disabled:text-gray-400';

const variantStyles = {
  filled: {
    primary:
      'border-transparent bg-primary-500 text-white hover:bg-primary-600',
    danger: 'border-transparent bg-red-500 text-white hover:bg-red-600',
    gray: 'border-transparent bg-gray-300 text-gray-900 hover:bg-gray-600',
  },
  outline: {
    primary: 'border-primary-500 text-primary-500 hover:bg-primary-50',
    danger: 'border-red-500 text-red-500 hover:bg-red-50',
    gray: 'border-gray-300 text-gray-900 hover:bg-gray-100',
  },
  ghost: {
    primary: 'border-transparent text-primary-500 hover:bg-primary-50',
    danger: 'border-transparent text-red-500 hover:bg-red-50',
    gray: 'border-transparent text-gray-900 hover:bg-gray-100',
  },
};

export function Button({
  children,
  className,
  type = 'button',
  variant = 'filled',
  color = 'primary',
  ...props
}: ButtonProps) {
  const style = variantStyles[variant][color];

  return (
    <button
      type={type}
      className={`${baseStyles} ${style} ${className ?? ''}`}
      {...props}
    >
      {children}
    </button>
  );
}
