'use client';

import { useEffect, useRef, useState } from 'react';

import type { Product } from '@/types/product';
import {
  createKakaoMarker,
  getKakaoMaps,
  initKakaoMap,
  loadKakaoMapsSDK,
} from '@/lib/kakao/map';
import type { KakaoMapInstance, KakaoMarkerInstance } from '@/lib/kakao/map';
import type { UserLocation } from '@/hooks/consumer/useUserLocation';

import { StoreProductBottomSheet } from './StoreProductBottomSheet';

interface StoreMarker {
  storeId: string;
  marker: KakaoMarkerInstance;
}

interface StoreMapViewProps {
  location: UserLocation;
  products: Product[];
}

export function StoreMapView({ location, products }: StoreMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMapInstance | null>(null);
  const markersRef = useRef<StoreMarker[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let mounted = true;

    setMapReady(false);
    void loadKakaoMapsSDK().then(() => {
      if (!mounted || !containerRef.current) return;
      mapRef.current = initKakaoMap(containerRef.current, {
        lat: location.lat,
        lng: location.lng,
      });
      setMapReady(true);
    });

    return () => {
      mounted = false;
    };
  }, [location.lat, location.lng]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    for (const { marker } of markersRef.current) {
      marker.setMap(null);
    }
    markersRef.current = [];

    const storeMap = new Map<string, { storeLat: number; storeLng: number }>();
    for (const product of products) {
      if (
        product.storeLat !== undefined &&
        product.storeLng !== undefined &&
        !storeMap.has(product.storeId)
      ) {
        storeMap.set(product.storeId, {
          storeLat: product.storeLat,
          storeLng: product.storeLng,
        });
      }
    }

    const maps = getKakaoMaps();
    for (const [storeId, { storeLat, storeLng }] of storeMap.entries()) {
      const marker = createKakaoMarker(mapRef.current, storeLat, storeLng);
      const capturedId = storeId;
      maps.event.addListener(marker, 'click', () => {
        setSelectedStoreId(capturedId);
      });
      markersRef.current.push({ storeId, marker });
    }
  }, [mapReady, products]);

  const storeProducts = selectedStoreId
    ? products.filter((p) => p.storeId === selectedStoreId)
    : [];

  return (
    <div className="relative h-full w-full">
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p className="text-sm text-gray-500">지도를 불러오는 중...</p>
        </div>
      )}
      <div ref={containerRef} className="h-full w-full" />
      <StoreProductBottomSheet
        storeId={selectedStoreId}
        products={storeProducts}
        onClose={() => setSelectedStoreId(null)}
      />
    </div>
  );
}
