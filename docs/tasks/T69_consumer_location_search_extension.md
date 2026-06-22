# T69. 소비자 위치/검색 기능 확장

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P5

- 선행 조건:
  - 선행 task: T21. 지도 기반 조회 및 거리순 정렬

- 분류:
  기능

- 사용자 흐름:
  Customer

- 주 담당 역할:
  Customer-FE, Domain

- 보조 역할:
  Architecture

- 배경:
  T21에서 소비자 위치는 localStorage에만 저장하고 검색 반경은 3km로 고정했다. 위치 기기 간 동기화와 반경 조절 기능은 후속으로 분리했다.

- 문제:
  - 위치가 localStorage에만 저장돼 다른 기기에서 재설정이 필요하다.
  - 검색 반경이 3km로 고정되어 있어 사용자가 조절할 수 없다.

- 작업 내용:
  - 소비자 위치를 DB(users 또는 별도 테이블)에 저장하고 로그인 시 기기 간 동기화한다 (localStorage 우선, DB fallback hybrid 방식).
  - `/map` 또는 홈 화면에 반경 조절 UI를 추가한다 (예: 1km / 3km / 5km 선택).
  - 반경 변경 시 상품 목록과 지도 핀을 재조회한다.

- 관련 파일/영역:
  - `src/hooks/consumer/useUserLocation.ts`
  - `src/app/api/users/` 또는 신규 위치 API
  - `src/components/consumer/MapPageClient.tsx`
  - `src/components/consumer/ConsumerPageClient.tsx`
  - `supabase/migrations/`

- 예상 난이도:
  중간

- 완료 기준:
  - 로그인 상태에서 위치 저장 시 DB에도 반영되고 다른 기기에서 불러온다.
  - 사용자가 검색 반경을 선택할 수 있고 변경 시 목록이 갱신된다.
