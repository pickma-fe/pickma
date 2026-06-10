'use client';

import { MapPinIcon } from 'lucide-react';
import { useState } from 'react';

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
  const [geocodeError, setGeocodeError] = useState(false);

  const handleClick = async () => {
    setGeocodeError(false);
    await openPostcodeSearch(
      (info) => {
        onLocationChange({
          lat: info.latitude,
          lng: info.longitude,
          address: info.address,
        });
      },
      () => setGeocodeError(true)
    );
  };

  return (
    <div className="flex shrink-0 flex-col items-start">
      <Button
        type="button"
        variant="ghost"
        color="gray"
        className="flex items-center gap-1.5 px-2 py-1.5 text-sm"
        onClick={() => void handleClick()}
      >
        <MapPinIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="max-w-28 truncate">
          {location ? location.address : '위치 설정'}
        </span>
      </Button>
      {geocodeError && (
        <p className="px-2 text-xs text-red-500">
          좌표를 가져오지 못했습니다. 다시 시도해 주세요.
        </p>
      )}
    </div>
  );
}
