interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const isTop = position === 'top';

  return (
    <div className="group relative w-fit">
      {children}
      <div
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 ${
          isTop ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
        }`}
      >
        {content}
        <span
          aria-hidden="true"
          className={`absolute left-1/2 -translate-x-1/2 border-4 border-transparent ${
            isTop
              ? 'top-full border-t-gray-900'
              : 'bottom-full border-b-gray-900'
          }`}
        />
      </div>
    </div>
  );
}
