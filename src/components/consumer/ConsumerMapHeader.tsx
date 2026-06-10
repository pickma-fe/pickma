'use client';

import { ArrowLeftIcon, MapPinIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { openPostcodeSearch } from '@/lib/kakao/postcode';
import type { UserLocation } from '@/hooks/consumer/useUserLocation';
import { Button } from '@/components/common';

interface ConsumerMapHeaderProps {
  location: UserLocation | null;
  onLocationChange: (location: Omit<UserLocation, 'savedAt'>) => void;
}

export function ConsumerMapHeader({
  location,
  onLocationChange,
}: ConsumerMapHeaderProps) {
  const [geocodeError, setGeocodeError] = useState(false);

  const handleLocationClick = async () => {
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
    <header className="flex shrink-0 flex-col border-b border-gray-200 px-4 py-2">
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
          aria-label="홈으로 이동"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <Button
            type="button"
            variant="ghost"
            color="gray"
            className="flex items-center gap-1.5 px-2 py-1.5 text-sm"
            onClick={() => void handleLocationClick()}
          >
            <MapPinIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="max-w-64 truncate">
              {location ? location.address : '위치 설정'}
            </span>
          </Button>
        </div>
      </div>
      {geocodeError && (
        <p className="pb-1 pl-12 text-xs text-red-500">
          좌표를 가져오지 못했습니다. 다시 시도해 주세요.
        </p>
      )}
    </header>
  );
}
