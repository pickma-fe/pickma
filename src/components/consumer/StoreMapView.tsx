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
    let handleIdle: (() => void) | null = null;
    let mapInstance: KakaoMapInstance | null = null;

    setMapReady(false);
    setMapError(false);

    void loadKakaoMapsSDK()
      .then(() => {
        if (!mounted || !containerRef.current) return;

        mapInstance = initKakaoMap(containerRef.current, {
          lat: location.lat,
          lng: location.lng,
        });
        mapRef.current = mapInstance;

        const maps = getKakaoMaps();

        const capturedMap = mapInstance;
        handleIdle = () => {
          const center = capturedMap.getCenter();
          onCenterChangeRef.current?.(center.getLat(), center.getLng());
        };
        maps.event.addListener(capturedMap, 'idle', handleIdle);

        clustererRef.current = createMarkerClusterer(capturedMap);
        setMapReady(true);
      })
      .catch(() => {
        if (mounted) setMapError(true);
      });

    return () => {
      mounted = false;

      if (mapInstance && handleIdle) {
        try {
          const maps = getKakaoMaps();
          maps.event.removeListener(mapInstance, 'idle', handleIdle);
        } catch {
          // SDK 언로드 상태에서 removeListener 실패 시 무시
        }
      }

      for (const { marker } of markersRef.current) {
        marker.setMap(null);
      }
      markersRef.current = [];

      if (clustererRef.current) {
        clustererRef.current.clear();
        clustererRef.current = null;
      }

      mapRef.current = null;
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
