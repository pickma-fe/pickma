# T68. 지도 UI/UX 개선

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

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

- 작업 내용:
  - 하단 시트를 반응형으로 전환한다: 모바일은 현행 유지(하단 슬라이드), 데스크탑(`md+`)은 우측 사이드바로 표시.
  - 지도 드래그/줌 종료 시 현재 지도 중심 좌표로 목록을 재조회한다.
  - Kakao Maps MarkerClusterer를 적용해 줌 레벨에 따라 겹치는 핀을 클러스터링한다.
  - FAB 사용성 피드백에 따라 위치 또는 진입 방식을 조정한다.

- 관련 파일/영역:
  - `src/components/consumer/StoreProductBottomSheet.tsx`
  - `src/components/consumer/StoreMapView.tsx`
  - `src/components/consumer/MapPageClient.tsx`
  - `src/components/consumer/MapViewFab.tsx`

- 예상 난이도:
  중간

- 완료 기준:
  - 데스크탑에서 핀 클릭 시 우측 사이드바로 표시된다.
  - 지도 영역 이동 후 목록이 현재 중심 기준으로 갱신된다.
  - 밀집 영역에서 핀 클러스터링이 동작한다.
