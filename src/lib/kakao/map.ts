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

let sdkLoaded = false;

function loadScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${url}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Kakao Maps SDK 로드 실패'));
    document.head.appendChild(script);
  });
}

export async function loadKakaoMapsSDK(): Promise<void> {
  const win = window as unknown as KakaoSDKWindow;
  if (sdkLoaded || typeof win.kakao?.maps?.Map === 'function') {
    sdkLoaded = true;
    return;
  }
  const appKey = process.env.NEXT_PUBLIC_KAKAO_MAPS_APP_KEY;
  await loadScript(
    `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services&autoload=false`
  );
  await new Promise<void>((resolve) => {
    (window as unknown as KakaoSDKWindow).kakao.maps.load(resolve);
  });
  sdkLoaded = true;
}

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
