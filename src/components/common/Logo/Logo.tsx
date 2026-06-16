import { LogoIcon } from './LogoIcon';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  iconClassName?: string;
  textClassName?: string;
}

const iconSizeClass = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-12 h-12' };
const textSizeClass = {
  sm: 'text-primary-600 font-bold text-xl',
  md: 'text-primary-600 font-bold text-2xl',
  lg: 'text-primary-600 font-bold text-3xl',
};

export default function Logo({
  size = 'lg',
  iconClassName,
  textClassName,
}: LogoProps) {
  return (
    <div className="flex flex-row items-end gap-2">
      <LogoIcon
        aria-hidden="true"
        focusable="false"
        className={iconClassName ?? iconSizeClass[size]}
      />
      <span className={textClassName ?? textSizeClass[size]}>픽마</span>
    </div>
  );
}
