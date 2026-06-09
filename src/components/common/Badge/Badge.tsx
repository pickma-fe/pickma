import type { ReactNode } from 'react';

/**
 * Badge 컴포넌트
 *
 * 상태 표시 (ex. 접수 대기, 준비 완료)
 * 강조 요소 (ex. 할인율, 마감 임박)
 *
 * variant:
 * - solid   : 강한 강조 (할인율, 마감)
 * - soft    : 상태 표시
 *
 * color:
 * - primary : 브랜드 컬러
 * - success : 완료 상태
 * - warning : 대기 상태
 * - info    : 진행 중
 * - danger  : 에러/취소
 * - gray    : 기본/비활성
 * - dark    : 마감 시간
 *
 */

interface BadgeProps {
  children: ReactNode;
  variant?: 'solid' | 'soft';
  color?:
    | 'primary'
    | 'success'
    | 'warning'
    | 'info'
    | 'danger'
    | 'gray'
    | 'dark';
  rounded?: 'full' | 'md';
  className?: string;
  role?: 'status' | 'img';
  'aria-label'?: string;
}

const baseStyles = 'inline-flex items-center px-2 py-0.5 text-xs font-semibold';

const variantStyles = {
  solid: {
    primary: 'bg-primary-500 text-white',
    success: 'bg-primary-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white',
    danger: 'bg-red-500 text-white',
    gray: 'bg-gray-500 text-white',
    dark: 'bg-gray-900 text-white',
  },

  soft: {
    primary: 'bg-primary-100 text-primary-700',
    success: 'bg-primary-100 text-primary-700',
    warning: 'bg-yellow-100 text-yellow-700',
    info: 'bg-blue-100 text-blue-700',
    danger: 'bg-red-100 text-red-700',
    gray: 'bg-gray-100 text-gray-700',
    dark: 'bg-gray-900/10 text-gray-900',
  },
};

const roundedStyles = {
  full: 'rounded-full',
  md: 'rounded-md',
};

export function Badge({
  children,
  variant = 'soft',
  color = 'primary',
  rounded = 'full',
  className = '',
  role,
  'aria-label': ariaLabel,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`${baseStyles} ${variantStyles[variant][color]} ${roundedStyles[rounded]} ${className}`}
      role={role}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </span>
  );
}
