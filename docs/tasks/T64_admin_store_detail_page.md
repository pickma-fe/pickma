# T64. 관리자 가게 상세 화면 구현

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P2

- 선행 조건:
  - 선행 task: T04. 관리자 가게 목록 real endpoint 및 화면 구현

- 분류:
  화면/UI

- 사용자 흐름:
  Admin

- 주 담당 역할:
  Admin-FE

- 보조 역할:
  API, Domain

- 배경:
  T04에서 `/admin/stores` 목록과 `GET /api/admin/stores` real endpoint를 구현했지만, IA에 남아 있는 `/admin/stores/[id]` 가게 상세 조회 경로는 별도 화면과 API 계약이 필요하다.

- 문제:
  관리자가 가게 목록에서 특정 가게의 상세 정보, 운영 상태, 판매자/상품/주문 연관 정보를 확인할 수 있는 화면이 없다.

- 작업 내용:
  - `/admin/stores/[id]` 상세 페이지를 구현한다.
  - 관리자 전용 가게 상세 API 또는 기존 목록 API 기반 상세 조회 방식을 결정한다.
  - 가게 기본 정보, 상태, 운영 상태, 주소/연락처 등 상세 정보를 렌더링한다.
  - 목록 화면에서 상세 화면으로 진입하는 액션을 연결한다.
  - 권한 검증과 잘못된 id/미존재 가게 처리 방식을 정한다.

- 관련 파일/영역:
  - `src/app/(admin)/admin/stores/[id]/`
  - `src/app/(admin)/admin/stores/_components/*`
  - `src/app/api/admin/stores/*`
  - `src/api/admin/stores/*`
  - `src/hooks/admin/stores/*`
  - `src/contracts/admin.ts`

- 예상 난이도:
  보통

- 완료 기준:
  - 관리자가 `/admin/stores/[id]`에서 특정 가게 상세 정보를 확인할 수 있다.
  - `/admin/stores` 목록에서 상세 화면으로 이동할 수 있다.
  - 관리자 권한이 없는 사용자는 접근 불가 처리된다.
  - 미존재 가게 또는 잘못된 id 입력 시 일관된 에러/404 처리가 된다.

- 확인 필요 사항:
  - 상세 API를 `GET /api/admin/stores/:storeId`로 추가할지, 목록 API 결과를 기반으로 구성할지 결정 필요.
  - 상세 화면에 판매자, 상품, 주문 요약까지 포함할지 후속 task로 분리할지 결정 필요.
