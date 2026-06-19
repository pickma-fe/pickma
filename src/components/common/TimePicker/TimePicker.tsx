'use client';

import { ChevronDownIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

interface TimePickerProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const BASE_MINUTES = [
  '00',
  '05',
  '10',
  '15',
  '20',
  '25',
  '30',
  '35',
  '40',
  '45',
  '50',
  '55',
];

const chevronClass =
  'pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400';

export function TimePicker({
  id,
  label,
  value,
  onChange,
  onBlur,
  disabled,
  invalid,
  describedBy,
}: TimePickerProps) {
  const [rawHh = '00', rawMm = '00'] = (value ?? '').split(':');
  const hh = rawHh.padStart(2, '0');
  const mm = rawMm.padStart(2, '0');
  const minuteOptions = BASE_MINUTES.includes(mm)
    ? BASE_MINUTES
    : [...BASE_MINUTES, mm].sort();

  const selectClass = cn(
    'w-full appearance-none rounded-md border bg-white py-2 pl-3 pr-8 text-sm outline-none',
    invalid
      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-300'
      : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-300',
    disabled ? 'cursor-default bg-gray-100 text-gray-400' : 'text-gray-700'
  );

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <select
          id={id}
          value={hh}
          onChange={(e) => onChange(`${e.target.value}:${mm}`)}
          onBlur={onBlur}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          aria-label={label ? `${label} 시` : '시'}
          className={selectClass}
        >
          {HOURS.map((h) => (
            <option key={h} value={h}>
              {h}시
            </option>
          ))}
        </select>
        <ChevronDownIcon aria-hidden="true" className={chevronClass} />
      </div>
      <span aria-hidden="true" className="text-gray-400">
        :
      </span>
      <div className="relative flex-1">
        <select
          value={mm}
          onChange={(e) => onChange(`${hh}:${e.target.value}`)}
          onBlur={onBlur}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          aria-label={label ? `${label} 분` : '분'}
          className={selectClass}
        >
          {minuteOptions.map((m) => (
            <option key={m} value={m}>
              {m}분
            </option>
          ))}
        </select>
        <ChevronDownIcon aria-hidden="true" className={chevronClass} />
      </div>
    </div>
  );
}
