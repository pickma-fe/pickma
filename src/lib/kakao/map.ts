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

interface KakaoMapsConstructors {
  Map: new (container: HTMLElement, options: object) => KakaoMapInstance;
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  Marker: new (options: object) => KakaoMarkerInstance;
  event: KakaoMapsEvent;
  load(callback: () => void): void;
}

interface KakaoSDKWindow {
  kakao: { maps: KakaoMapsConstructors };
}

export type { KakaoMapInstance, KakaoMarkerInstance };
export { loadKakaoMapsSDK } from './sdk';

export function getKakaoMaps(): KakaoMapsConstructors {
  return (window as unknown as KakaoSDKWindow).kakao.maps;
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
