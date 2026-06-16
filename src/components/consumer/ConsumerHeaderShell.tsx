'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { useUserLocation } from '@/hooks/consumer/useUserLocation';

import { ConsumerHeader } from './ConsumerHeader';
import { FakeSearchButton } from './FakeSearchButton';
import { LocationPickerButton } from './LocationPickerButton';

export function ConsumerHeaderShell() {
  const pathname = usePathname();
  const { location, saveLocation } = useUserLocation();

  let slot: ReactNode;

  if (pathname === '/') {
    slot = (
      <div className="flex w-full items-center justify-between gap-2 sm:justify-start">
        <LocationPickerButton
          location={location}
          onLocationChange={saveLocation}
        />
        <FakeSearchButton />
      </div>
    );
  } else if (pathname === '/search') {
    slot = (
      <div className="flex w-full">
        <LocationPickerButton
          location={location}
          onLocationChange={saveLocation}
        />
      </div>
    );
  }

  return <ConsumerHeader slot={slot} />;
}
