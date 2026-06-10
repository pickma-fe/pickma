'use client';

import { MapPinIcon } from 'lucide-react';

import { openPostcodeSearch } from '@/lib/kakao/postcode';
import type { UserLocation } from '@/hooks/consumer/useUserLocation';
import { Button } from '@/components/common';

interface LocationPickerButtonProps {
  location: UserLocation | null;
  onLocationChange: (location: Omit<UserLocation, 'savedAt'>) => void;
}

export function LocationPickerButton({
  location,
  onLocationChange,
}: LocationPickerButtonProps) {
  const handleClick = async () => {
    await openPostcodeSearch((info) => {
      onLocationChange({
        lat: info.latitude,
        lng: info.longitude,
        address: info.address,
      });
    });
  };

  return (
    <Button
      type="button"
      variant="ghost"
      color="gray"
      className="flex shrink-0 items-center gap-1.5 px-2 py-1.5 text-sm"
      onClick={() => void handleClick()}
    >
      <MapPinIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="max-w-28 truncate">
        {location ? location.address : '위치 설정'}
      </span>
    </Button>
  );
}
