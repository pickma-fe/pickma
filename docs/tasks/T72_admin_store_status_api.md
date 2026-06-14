# T72. 관리자 가게 상태 변경 API 구현

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P3

- 선행 조건:
  - 선행 task: T04. 관리자 판매자 신청 목록/상세/심사 API

- 분류:
  기능

- 사용자 흐름:
  Admin

- 주 담당 역할:
  Shared-FE

- 보조 역할:
  Architecture

- 배경:
  `docs/api_spec.md` 10.2절에 `PATCH /api/admin/stores/:storeId/status`가 명세되어 있으나 Route Handler가 구현되지 않았다. 관리자 화면에서 가게 활성/비활성 처리가 불가능한 상태다.

- 문제:
  `src/app/api/admin/stores/` 아래에 `[storeId]/status/route.ts`가 없어 Admin stores 페이지에서 가게 상태 변경 액션이 막혀 있다.

- 작업 내용:
  - `src/app/api/admin/stores/[storeId]/status/route.ts` PATCH handler 구현
  - `src/app/api/admin/stores/[storeId]/status/_lib/service.ts` 작성 (status 업데이트 로직)
  - `src/contracts/store.ts`에 request/response DTO 추가
  - `docs/api_spec.md` 10.2절 구현 완료 표기

- 관련 파일/영역:
  - `src/app/api/admin/stores/[storeId]/status/route.ts` (신규)
  - `src/app/api/admin/stores/[storeId]/status/_lib/service.ts` (신규)
  - `src/contracts/store.ts`
  - `docs/api_spec.md` 10.2절

- 예상 난이도:
  낮음

- 완료 기준:
  - `PATCH /api/admin/stores/:storeId/status` 요청으로 가게 상태를 `active`/`inactive`로 변경할 수 있다.
  - Admin 권한 없는 요청은 403을 반환한다.
  - 존재하지 않는 storeId는 404를 반환한다.
