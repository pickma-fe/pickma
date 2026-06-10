let sdkLoadingPromise: Promise<void> | null = null;

export function loadScript(url: string): Promise<void> {
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

export function loadKakaoMapsSDK(): Promise<void> {
  if (sdkLoadingPromise) return sdkLoadingPromise;

  const win = window as {
    kakao?: { maps?: { Map?: unknown; load?: unknown } };
  };
  if (typeof win.kakao?.maps?.Map === 'function') {
    sdkLoadingPromise = Promise.resolve();
    return sdkLoadingPromise;
  }

  const appKey = process.env.NEXT_PUBLIC_KAKAO_MAPS_APP_KEY;
  if (!appKey) {
    return Promise.reject(
      new Error(
        'NEXT_PUBLIC_KAKAO_MAPS_APP_KEY 환경 변수가 설정되지 않았습니다.'
      )
    );
  }
  sdkLoadingPromise = loadScript(
    `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services&autoload=false`
  )
    .then(
      () =>
        new Promise<void>((resolve, reject) => {
          const loaded = window as { kakao?: { maps?: { load?: unknown } } };
          if (typeof loaded.kakao?.maps?.load !== 'function') {
            reject(
              new Error(
                'Kakao Maps SDK 로드 실패: load 함수를 찾을 수 없습니다.'
              )
            );
            return;
          }
          loaded.kakao.maps.load(resolve);
        })
    )
    .catch((error: unknown) => {
      sdkLoadingPromise = null;
      throw error;
    });
  return sdkLoadingPromise;
}
