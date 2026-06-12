'use client';

import { useEffect, useRef, useState } from 'react';

import type { Product } from '@/types/product';
import {
  createKakaoMarker,
  createMarkerClusterer,
  getKakaoMaps,
  initKakaoMap,
  loadKakaoMapsSDK,
} from '@/lib/kakao/map';
import type {
  KakaoMapInstance,
  KakaoMarkerClustererInstance,
  KakaoMarkerInstance,
} from '@/lib/kakao/map';
import type { UserLocation } from '@/hooks/consumer/useUserLocation';

import { StoreProductBottomSheet } from './StoreProductBottomSheet';

interface StoreMarker {
  storeId: string;
  marker: KakaoMarkerInstance;
}

interface StoreMapViewProps {
  location: UserLocation;
  products: Product[];
  onCenterChange?: (lat: number, lng: number) => void;
}

export function StoreMapView({
  location,
  products,
  onCenterChange,
}: StoreMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMapInstance | null>(null);
  const markersRef = useRef<StoreMarker[]>([]);
  const clustererRef = useRef<KakaoMarkerClustererInstance | null>(null);
  const onCenterChangeRef = useRef(onCenterChange);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  useEffect(() => {
    onCenterChangeRef.current = onCenterChange;
  }, [onCenterChange]);

  useEffect(() => {
    if (!containerRef.current) return;
    let mounted = true;

    setMapReady(false);
    setMapError(false);
    void loadKakaoMapsSDK()
      .then(() => {
        if (!mounted || !containerRef.current) return;
        const map = initKakaoMap(containerRef.current, {
          lat: location.lat,
          lng: location.lng,
        });
        mapRef.current = map;

        const maps = getKakaoMaps();
        const handleIdle = () => {
          const center = map.getCenter();
          onCenterChangeRef.current?.(center.getLat(), center.getLng());
        };
        maps.event.addListener(map, 'idle', handleIdle);

        clustererRef.current = createMarkerClusterer(map);
        setMapReady(true);
      })
      .catch(() => {
        if (mounted) setMapError(true);
      });

    return () => {
      mounted = false;
    };
  }, [location.lat, location.lng]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !clustererRef.current) return;

    for (const { marker } of markersRef.current) {
      marker.setMap(null);
    }
    markersRef.current = [];
    clustererRef.current.clear();

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
    const newMarkers: KakaoMarkerInstance[] = [];

    for (const [storeId, { storeLat, storeLng }] of storeMap.entries()) {
      // map 인자 제거 → 클러스터러가 마커 소유/연결 담당
      const marker = createKakaoMarker(storeLat, storeLng);
      const capturedId = storeId;
      maps.event.addListener(marker, 'click', () => {
        setSelectedStoreId(capturedId);
      });
      markersRef.current.push({ storeId, marker });
      newMarkers.push(marker);
    }

    clustererRef.current.addMarkers(newMarkers);
  }, [mapReady, products]);

  const validSelectedStoreId =
    selectedStoreId && products.some((p) => p.storeId === selectedStoreId)
      ? selectedStoreId
      : null;

  const storeProducts = validSelectedStoreId
    ? products.filter((p) => p.storeId === validSelectedStoreId)
    : [];

  return (
    <div className="relative h-full w-full">
      {!mapReady && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p className="text-sm text-gray-500">지도를 불러오는 중...</p>
        </div>
      )}
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p className="text-sm text-gray-500">지도를 불러올 수 없습니다.</p>
        </div>
      )}
      <div ref={containerRef} className="h-full w-full" />
      <StoreProductBottomSheet
        storeId={validSelectedStoreId}
        products={storeProducts}
        onClose={() => setSelectedStoreId(null)}
      />
    </div>
  );
}
