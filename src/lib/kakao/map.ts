interface KakaoLatLng {
  getLat(): number;
  getLng(): number;
}

interface KakaoMapInstance {
  setCenter(latlng: KakaoLatLng): void;
  getCenter(): KakaoLatLng;
}

interface KakaoMarkerInstance {
  setMap(map: KakaoMapInstance | null): void;
  getPosition(): KakaoLatLng;
}

interface KakaoMapsEvent {
  addListener(target: object, event: string, handler: () => void): void;
  removeListener(target: object, event: string, handler: () => void): void;
}

interface KakaoMarkerClustererInstance {
  addMarkers(markers: KakaoMarkerInstance[]): void;
  clear(): void;
}

interface KakaoMapsConstructors {
  Map: new (container: HTMLElement, options: object) => KakaoMapInstance;
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  Marker: new (options: object) => KakaoMarkerInstance;
  MarkerClusterer: new (options: object) => KakaoMarkerClustererInstance;
  event: KakaoMapsEvent;
  load(callback: () => void): void;
}

export type {
  KakaoMapInstance,
  KakaoMarkerInstance,
  KakaoMarkerClustererInstance,
};
export { loadKakaoMapsSDK } from './sdk';

export function getKakaoMaps(): KakaoMapsConstructors {
  const win = window as { kakao?: { maps?: KakaoMapsConstructors } };
  if (!win.kakao?.maps) {
    throw new Error(
      'Kakao Maps SDK가 로드되지 않았습니다. loadKakaoMapsSDK()를 먼저 호출하세요.'
    );
  }
  return win.kakao.maps;
}

export interface MapInitOptions {
  lat: number;
  lng: number;
  level?: number;
}

export function initKakaoMap(
  container: HTMLElement,
  options: MapInitOptions
): KakaoMapInstance {
  const maps = getKakaoMaps();
  const center = new maps.LatLng(options.lat, options.lng);
  return new maps.Map(container, { center, level: options.level ?? 4 });
}

export function createKakaoMarker(
  map: KakaoMapInstance,
  lat: number,
  lng: number
): KakaoMarkerInstance {
  const maps = getKakaoMaps();
  const position = new maps.LatLng(lat, lng);
  return new maps.Marker({ position, map });
}

export function createMarkerClusterer(
  map: KakaoMapInstance
): KakaoMarkerClustererInstance {
  const maps = getKakaoMaps();
  return new maps.MarkerClusterer({
    map,
    averageCenter: true,
    minLevel: 6,
  });
}
