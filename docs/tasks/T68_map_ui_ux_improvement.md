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

- 작업 내용:
  - 하단 시트를 반응형으로 전환한다: 모바일은 현행 유지(하단 슬라이드), 데스크탑(`md+`)은 우측 사이드바로 표시.
  - 지도 드래그/줌 종료 시 현재 지도 중심 좌표로 목록을 재조회한다.
  - Kakao Maps MarkerClusterer를 적용해 줌 레벨에 따라 겹치는 핀을 클러스터링한다.
  - FAB 사용성 피드백에 따라 위치 또는 진입 방식을 조정한다.
  - 사이드바/하단 시트 상품 아이템을 상품 상세(`/products/:id`)로 이동하는 링크로 전환한다.
  - 상품 아이템에 픽업 시간 정보를 추가한다.
  - 지도 이동 중 사이드바/하단 시트 깜빡임 방지를 위해 `useProducts`에 `keepPrevious` 옵션을 추가한다.

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
  - 데스크탑에서 핀 클릭 시 우측 사이드바로 표시된다.
  - 지도 영역 이동 후 목록이 현재 중심 기준으로 갱신된다.
  - 밀집 영역에서 핀 클러스터링이 동작한다.
  - 사이드바/하단 시트 상품 클릭 시 상품 상세 페이지로 이동한다.
  - 지도 이동 중 사이드바/하단 시트가 깜빡이지 않는다.

- 구현 결과:
  - 반응형 레이아웃: 모바일(`md` 미만)은 하단 슬라이드 시트, 데스크탑(`md+`)은 우측 고정 사이드바(`w-80`)로 분기 처리했다.
  - 지도 중심 재조회: Kakao Maps `idle` 이벤트로 드래그/줌 종료를 감지해 `onCenterChange` 콜백으로 중심 좌표를 상위로 전달하고, `MapPageClient`의 `mapCenter` state 갱신으로 `useProducts` 재조회를 트리거한다.
  - 핀 클러스터링: `src/lib/kakao/map.ts`에 `KakaoMarkerClustererInstance` 타입과 `createMarkerClusterer` 유틸을 추가하고, SDK URL에 `clusterer` 라이브러리를 포함했다. 줌 레벨 6 이상에서 인접 핀이 클러스터로 묶인다.
  - 상품 상세 진입: 상품 아이템을 `<Link href="/products/:id">`로 감싸 지도에서 바로 상품 상세로 이동할 수 있도록 했다. 픽업 시간 정보도 함께 노출한다.
  - FAB 위치: `bottom-6` → `bottom-24`로 조정해 모바일 하단 네비게이션과의 겹침을 방지했다.
  - 깜빡임 방지: `useProducts`에 `keepPrevious` 옵션을 추가해 지도 이동 중 새 쿼리 로딩 시 이전 데이터를 유지하도록 했다. `MapPageClient`에서 `keepPrevious: true`로 사용한다.
