'use client';

import { usePathname } from 'next/navigation';

import { useUserLocation } from '@/hooks/consumer/useUserLocation';

import { ConsumerHeader } from './ConsumerHeader';
import { LocationPickerButton } from './LocationPickerButton';

export function ConsumerHeaderShell() {
  const pathname = usePathname();
  const { location, saveLocation } = useUserLocation();

  const showLocationSlot = pathname === '/' || pathname === '/search';

  const slot = showLocationSlot ? (
    <LocationPickerButton location={location} onLocationChange={saveLocation} />
  ) : undefined;

  return <ConsumerHeader slot={slot} />;
}
