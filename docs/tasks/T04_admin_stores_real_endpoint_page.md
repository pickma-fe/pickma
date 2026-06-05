# T04. 관리자 가게 목록 real endpoint 및 화면 구현

- 상태:
  완료

- GitHub Issue:
  230

- 우선순위:
  P0

- 선행 조건:
  - 선행 task: T07. service role 사용 기준 및 owner scope 테스트 수립

- 분류:
  기능

- 사용자 흐름:
  Admin / Seller

- 주 담당 역할:
  Admin-FE

- 보조 역할:
  Domain, Architecture

- 배경:
  `/admin/stores`는 placeholder이고 `GET /api/admin/stores`는 real mode에서 501로 남아 있다.

- 문제:
  운영자가 전체 가게 상태를 확인할 수 없어 CS와 판매자 운영 대응이 어렵다.

- 작업 내용:
  - `GET /api/admin/stores` real service/mapper/schema를 구현한다.
  - 목록 pagination, status/keyword/region 필터의 최소 범위를 정한다.
  - `/admin/stores` 페이지를 실제 hook과 연결한다.
  - summary가 필요하면 P2 summary endpoint로 분리할 수 있게 meta 구조를 설계한다.
  - admin 전용 table/card/filter는 route-local `_components` 우선 배치 기준을 따른다.

- 관련 파일/영역:
  - `src/app/api/admin/stores/*`
  - `src/api/admin/stores/*`
  - `src/hooks/admin/stores/useAdminStores.ts`
  - `src/app/(admin)/admin/stores/page.tsx`
  - `src/contracts/admin.ts`

- 예상 난이도:
  중간

- 완료 기준:
  - real mode에서 `GET /api/admin/stores`가 501을 반환하지 않는다.
  - 관리자 가게 목록이 실제 데이터로 렌더링된다.
  - pagination/filter contract가 문서화된다.
  - API service 권한 검증 테스트가 있다.

- 구현 결과:
  - `GET /api/admin/stores` Route Handler를 real service/mapper/schema 기반으로 구현하고 501 반환을 제거했다.
  - `page`, `pageSize`, `keyword`, `status`, `region` query를 지원하고 mock mode도 동일 query 기준으로 필터링한다.
  - `src/api/admin/stores/adminStoreApi.ts`, `src/hooks/admin/stores/useAdminStores.ts`를 query params 기반으로 연결했다.
  - `/admin/stores` 페이지를 실제 hook 기반 목록/필터/페이지네이션 UI로 연결했다.
  - 관리자 공통 Header에서 admin 계정에만 `/admin` 진입 링크를 노출했다.
  - 관리자 사이드바를 `대시보드`와 `관리` 섹션으로 정리하고 `판매자 관리`, `가게 관리`를 평면 메뉴로 배치했다.
  - `src/app/api/admin/stores/route.test.ts`, `src/app/api/admin/stores/_lib/service.test.ts`로 권한 검증, query validation, mock/real 분기, service 필터 적용을 검증했다.
