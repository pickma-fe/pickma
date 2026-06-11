'use client';

import { MapPinIcon } from 'lucide-react';
import { useState } from 'react';

import { openPostcodeSearch } from '@/lib/kakao/postcode';
import type { UserLocation } from '@/hooks/consumer/useUserLocation';
import { Button } from '@/components/common';

interface NoLocationViewProps {
  onLocationChange: (location: Omit<UserLocation, 'savedAt'>) => void;
}

export function NoLocationView({ onLocationChange }: NoLocationViewProps) {
  const [geocodeError, setGeocodeError] = useState(false);

  const handleSetLocation = async () => {
    setGeocodeError(false);
    try {
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
    } catch {
      setGeocodeError(true);
    }
  };

  return (
    <div className="flex min-h-80 flex-col items-center justify-center gap-6 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-6 text-center">
      <MapPinIcon className="h-12 w-12 text-gray-300" aria-hidden="true" />
      <div>
        <p className="text-base font-semibold text-gray-700">
          위치를 설정해 주세요
        </p>
        <p className="mt-1 text-sm text-gray-500">
          내 위치 근처의 마감 할인 상품을 확인할 수 있어요
        </p>
      </div>
      <Button onClick={() => void handleSetLocation()}>위치 설정하기</Button>
      {geocodeError && (
        <p className="text-sm text-red-500">
          좌표를 가져오지 못했습니다. 다시 시도해 주세요.
        </p>
      )}
    </div>
  );
}
