'use client';

const RADIUS_OPTIONS = [1, 3, 5] as const;

interface SearchRadiusSelectorProps {
  radiusKm: number;
  onRadiusChange: (radiusKm: number) => void;
}

export function SearchRadiusSelector({
  radiusKm,
  onRadiusChange,
}: SearchRadiusSelectorProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label="검색 반경 선택"
    >
      <span className="text-sm font-medium text-gray-600">검색 반경</span>
      {RADIUS_OPTIONS.map((option) => {
        const isSelected = radiusKm === option;

        return (
          <button
            key={option}
            type="button"
            className={[
              'rounded-full border px-3 py-1.5 text-sm transition-colors',
              isSelected
                ? 'border-emerald-600 bg-emerald-50 font-semibold text-emerald-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900',
            ].join(' ')}
            aria-pressed={isSelected}
            onClick={() => onRadiusChange(option)}
          >
            {option}km
          </button>
        );
      })}
    </div>
  );
}
