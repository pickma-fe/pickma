# T68. 지도 UI/UX 개선

- 상태:
  완료

- GitHub Issue:
  266

- 우선순위:
  P2

- 선행 조건:
  - 선행 task: T21. 지도 기반 조회 및 거리순 정렬

- 분류:
  기능

- 사용자 흐름:
  Customer

- 주 담당 역할:
  Customer-FE

- 보조 역할:
  없음

- 배경:
  T21에서 구현한 `/map` 페이지와 FAB의 UI/UX를 개선한다. 반응형 레이아웃, 지도 인터랙션, 핀 렌더링 최적화를 포함한다.

- 문제:
  - 하단 시트가 데스크탑에서도 모바일 레이아웃으로 표시된다.
  - 지도 영역을 이동해도 목록이 갱신되지 않는다.
  - 가게가 밀집된 영역에서 핀이 겹쳐 클릭이 어렵다.
  - FAB 위치가 불편하다 판단될 경우 섹션 버튼 등으로 전환이 필요하다.
  - 지도에서 상품 확인 후 예약하려면 메인으로 돌아가 가게를 다시 검색해야 해서 흐름이 끊긴다.
  - 지도 이동 시 목록 재조회로 인해 사이드바/하단 시트가 깜빡이는 현상이 발생한다.
  - location 변경 시 이전 mapOffset이 유지되어 새 위치가 아닌 직전 지도 중심으로 상품이 조회된다.
  - 클러스터러에 마커를 추가하기 전 map에 먼저 붙어 렌더링/제어 책임이 섞인다.

- 작업 내용:
  - 하단 시트를 반응형으로 전환한다: 모바일은 현행 유지(하단 슬라이드), 데스크탑(`md+`)은 좌측 사이드바로 표시.
  - 지도 드래그/줌 종료 시 현재 지도 중심 좌표로 목록을 재조회한다.
  - Kakao Maps MarkerClusterer를 적용해 줌 레벨에 따라 겹치는 핀을 클러스터링한다.
  - 사이드바/하단 시트 상품 아이템을 상품 상세(`/products/[productId]`)로 이동하는 링크로 전환한다.
  - 상품 아이템에 픽업 시간 정보를 추가한다.
  - 지도 이동 중 사이드바/하단 시트 깜빡임 방지를 위해 `useProducts`에 `keepPrevious` 옵션을 추가한다.
  - location 변경 시 `mapOffset`을 즉시 초기화해 새 위치 기준으로 상품을 조회한다.
  - `createKakaoMarker`에서 map 인자를 제거해 클러스터러가 마커 소유/연결을 담당하도록 한다.
  - 모바일/데스크탑 패널 공통 로직을 `StorePanel` 컴포넌트로 추출한다.

- 관련 파일/영역:
  - `src/components/consumer/StoreProductBottomSheet.tsx`
  - `src/components/consumer/StoreMapView.tsx`
  - `src/components/consumer/MapPageClient.tsx`
  - `src/components/consumer/MapViewFab.tsx`
  - `src/lib/kakao/map.ts`
  - `src/lib/kakao/sdk.ts`
  - `src/hooks/products/useProducts.ts`

- 예상 난이도:
  중간

- 완료 기준:
  - 데스크탑에서 핀 클릭 시 좌측 사이드바로 표시된다.
  - 지도 영역 이동 후 목록이 현재 중심 기준으로 갱신된다.
  - 밀집 영역에서 핀 클러스터링이 동작한다.
  - 사이드바/하단 시트 상품 클릭 시 상품 상세 페이지(`/products/[productId]`)로 이동한다.
  - 지도 이동 중 사이드바/하단 시트가 깜빡이지 않는다.
  - location 변경 시 새 위치 기준으로 상품이 즉시 재조회된다.
  - 클러스터러가 마커 소유/연결을 단독으로 담당한다.

- 구현 결과:
  - 반응형 레이아웃: 모바일(`md` 미만)은 하단 슬라이드 시트, 데스크탑(`md+`)은 좌측 고정 사이드바(`w-80`)로 분기 처리했다. 공통 헤더/컨텐츠 로직은 `StorePanel` 컴포넌트로 추출해 중복을 제거했다.
  - 지도 중심 재조회: Kakao Maps `idle` 이벤트로 드래그/줌 종료를 감지해 `onCenterChange` 콜백으로 중심 좌표를 상위로 전달하고, `MapPageClient`의 `mapOffset` state 갱신으로 `useProducts` 재조회를 트리거한다.
  - location 동기화: location 변경 시 `handleLocationChange`에서 `setMapOffset(null)`을 즉시 호출해 이전 지도 중심으로 조회되는 문제를 해결했다. 또한 `key={locationKey}`로 `StoreMapView`를 리마운트해 지도 상태도 초기화한다.
  - 핀 클러스터링: `src/lib/kakao/map.ts`에 `KakaoMarkerClustererInstance` 타입과 `createMarkerClusterer` 유틸을 추가하고, SDK URL에 `clusterer` 라이브러리를 포함했다. `createKakaoMarker`에서 map 인자를 제거해 클러스터러가 마커 소유/연결을 단독으로 담당한다. 줌 레벨 6 이상에서 인접 핀이 클러스터로 묶인다. cleanup 시 idle 리스너 제거, 마커 detach, clusterer clear를 수행해 메모리 누수를 방지한다.
  - 상품 상세 진입: 상품 아이템을 `<Link href={`/products/${product.id}`}>`로 감싸 지도에서 바로 상품 상세(`/products/[productId]`)로 이동할 수 있도록 했다. 픽업 시간 정보도 함께 노출한다.
  - FAB 위치: dev 전용 Mock User 네비게이션을 기준으로 위치를 조정하면 production 환경에서 어색해지므로 `bottom-6` 원래 위치를 유지했다.
  - 깜빡임 방지: `useProducts`에 `keepPrevious` 옵션을 추가해 지도 이동 중 새 쿼리 로딩 시 이전 데이터를 유지하도록 했다. `MapPageClient`에서 `keepPrevious: true`로 사용한다.
