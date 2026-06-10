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

import { loadKakaoMapsSDK, loadScript } from './sdk';

export async function openPostcodeSearch(
  onSelect: (info: AddressInfo) => void,
  onError?: () => void
): Promise<void> {
  await loadScript(POSTCODE_SDK_URL);
  await loadKakaoMapsSDK();

  const sdk = window as unknown as KakaoSDKWindow;

  new sdk.daum.Postcode({
    oncomplete(data) {
      const address = (data.roadAddress || data.address).trim();
      if (!address) {
        onError?.();
        return;
      }
      const region = [data.sido, data.sigungu].filter(Boolean).join(' ');
      const geocoder = new sdk.kakao.maps.services.Geocoder();
      geocoder.addressSearch(address, (result, status) => {
        if (status === sdk.kakao.maps.services.Status.OK && result.length > 0) {
          const first = result[0];
          const latitude = parseFloat(first.y);
          const longitude = parseFloat(first.x);
          if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
            onError?.();
            return;
          }
          onSelect({ address, region, latitude, longitude });
        } else {
          onError?.();
        }
      });
    },
  }).open();
}
