'use client';

import { CheckIcon } from 'lucide-react';

interface SearchFilterRadioProps {
  id: string;
  name: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}

export function SearchFilterRadio({
  id,
  name,
  label,
  checked,
  onChange,
}: SearchFilterRadioProps) {
  return (
    <div className="flex items-center gap-3 text-sm text-gray-500">
      <input
        id={id}
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />

      <label htmlFor={id} className="flex cursor-pointer items-center gap-3">
        <span
          className={[
            'flex h-4 w-4 items-center justify-center rounded border',
            'peer-focus-visible:ring-primary-500 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2',
            checked
              ? 'border-primary-500 bg-primary-500'
              : 'border-gray-300 bg-white',
          ].join(' ')}
          aria-hidden="true"
        >
          {checked && <CheckIcon className="h-3 w-3 text-white" />}
        </span>

        <span>{label}</span>
      </label>
    </div>
  );
}
