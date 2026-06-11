'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';

import { useUserLocation } from '@/hooks/consumer/useUserLocation';
import { useProducts } from '@/hooks/products/useProducts';

import { ConsumerMapHeader } from './ConsumerMapHeader';
import { NoLocationView } from './NoLocationView';

const StoreMapView = dynamic(
  () => import('./StoreMapView').then((m) => m.StoreMapView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-gray-100">
        <p className="text-sm text-gray-500">지도를 불러오는 중...</p>
      </div>
    ),
  }
);

const MAP_PRODUCT_PAGE_SIZE = 50;

export function MapPageClient() {
  const { location, saveLocation } = useUserLocation();
  const geoAttempted = useRef(false);

  useEffect(() => {
    if (location || geoAttempted.current || !navigator.geolocation) return;

    geoAttempted.current = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        saveLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address: '현재 위치',
        });
      },
      () => {
        // TODO: logger 추가 후 위치 조회 실패 원본 로깅
      }
    );
  }, [location, saveLocation]);

  const { data: productList } = useProducts(
    {
      sort: 'distance',
      userLat: location?.lat,
      userLng: location?.lng,
      page: 1,
      pageSize: MAP_PRODUCT_PAGE_SIZE,
    },
    { enabled: !!location }
  );

  const products = productList?.items ?? [];

  return (
    <div className="flex h-dvh flex-col">
      <ConsumerMapHeader location={location} onLocationChange={saveLocation} />
      <main className="min-h-0 flex-1">
        {location ? (
          <StoreMapView location={location} products={products} />
        ) : (
          <div className="flex h-full items-center justify-center p-6">
            <NoLocationView onLocationChange={saveLocation} />
          </div>
        )}
      </main>
    </div>
  );
}
