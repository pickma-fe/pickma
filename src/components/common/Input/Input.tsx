'use client';

import {
  Field,
  Label,
  Input as HeadlessInput,
  Description,
} from '@headlessui/react';
import { type InputHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  endIconLabel?: string;
  onEndIconClick?: () => void;
}

export function Input({
  label,
  description,
  error,
  className,
  startIcon,
  endIcon,
  endIconLabel,
  onEndIconClick,
  disabled,
  required,
  ...props
}: InputProps) {
  return (
    <Field className="flex flex-col gap-1">
      {label && (
        <Label className="text-sm text-gray-500">
          {label}
          {required && (
            <span aria-hidden="true" className="ml-0.5 text-red-500">
              *
            </span>
          )}
        </Label>
      )}
      <div className="relative">
        {startIcon && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
          >
            {startIcon}
          </div>
        )}
        <HeadlessInput
          {...props}
          required={required}
          disabled={disabled}
          aria-required={required}
          invalid={Boolean(error)}
          className={cn(
            'focus:border-primary-500 focus:ring-primary-300 w-full rounded-md border py-2 text-sm outline-none placeholder:text-gray-300 focus:ring-2',
            'border-gray-200 data-invalid:border-red-500 data-invalid:focus:ring-red-300',
            'data-disabled:cursor-default data-disabled:bg-gray-100 data-disabled:text-gray-400',
            startIcon ? 'pl-9' : 'pl-4',
            endIcon ? 'pr-9' : 'pr-4',
            className
          )}
        />
        {endIcon &&
          (onEndIconClick ? (
            <button
              type="button"
              aria-label={endIconLabel}
              tabIndex={disabled ? -1 : 0}
              className={cn(
                'absolute top-1/2 right-3 -translate-y-1/2 text-gray-400',
                disabled ? 'cursor-default opacity-50' : 'cursor-pointer'
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={disabled ? undefined : onEndIconClick}
            >
              {endIcon}
            </button>
          ) : (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"
            >
              {endIcon}
            </div>
          ))}
      </div>
      {(description || error) && (
        <Description
          className={cn('text-sm', error ? 'text-red-500' : 'text-gray-500')}
        >
          {error ?? description}
        </Description>
      )}
    </Field>
  );
}
