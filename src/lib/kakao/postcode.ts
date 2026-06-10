export interface AddressInfo {
  address: string;
  region: string;
  latitude: number;
  longitude: number;
}

interface DaumPostcodeData {
  address: string;
  roadAddress: string;
  sido: string;
  sigungu: string;
}

interface GeocoderResult {
  x: string;
  y: string;
}

interface KakaoGeocoder {
  addressSearch(
    address: string,
    callback: (result: GeocoderResult[], status: string) => void
  ): void;
}

interface KakaoMapsServices {
  Geocoder: new () => KakaoGeocoder;
  Status: { OK: string };
}

interface KakaoMapsSDK {
  load(callback: () => void): void;
  services: KakaoMapsServices;
}

interface DaumPostcodeInstance {
  open(): void;
}

interface DaumPostcodeSDK {
  Postcode: new (options: {
    oncomplete: (data: DaumPostcodeData) => void;
  }) => DaumPostcodeInstance;
}

interface KakaoSDKWindow {
  kakao: { maps: KakaoMapsSDK };
  daum: DaumPostcodeSDK;
}

const POSTCODE_SDK_URL =
  'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';

function loadScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${url}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('스크립트 로드 실패'));
    document.head.appendChild(script);
  });
}

let kakaoMapsLoaded = false;

async function loadKakaoMaps(): Promise<void> {
  if (kakaoMapsLoaded) return;

  const appKey = process.env.NEXT_PUBLIC_KAKAO_MAPS_APP_KEY;
  await loadScript(
    `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services&autoload=false`
  );

  const sdk = window as unknown as KakaoSDKWindow;
  await new Promise<void>((resolve) => sdk.kakao.maps.load(resolve));
  kakaoMapsLoaded = true;
}

export async function openPostcodeSearch(
  onSelect: (info: AddressInfo) => void,
  onError?: () => void
): Promise<void> {
  await loadScript(POSTCODE_SDK_URL);
  await loadKakaoMaps();

  const sdk = window as unknown as KakaoSDKWindow;

  new sdk.daum.Postcode({
    oncomplete(data) {
      const address = data.roadAddress || data.address;
      const region = [data.sido, data.sigungu].filter(Boolean).join(' ');
      const geocoder = new sdk.kakao.maps.services.Geocoder();
      geocoder.addressSearch(address, (result, status) => {
        if (status === sdk.kakao.maps.services.Status.OK && result.length > 0) {
          const first = result[0];
          onSelect({
            address,
            region,
            latitude: parseFloat(first.y),
            longitude: parseFloat(first.x),
          });
        } else {
          onError?.();
        }
      });
    },
  }).open();
}
