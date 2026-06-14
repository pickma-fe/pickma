# T74. Supabase select 쿼리 반환 타입 안전성 개선

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P4

- 선행 조건:
  없음

- 분류:
  리팩토링

- 사용자 흐름:
  Shared

- 주 담당 역할:
  Backend

- 보조 역할:
  없음

- 배경:
  Supabase 클라이언트는 `.select()` 인자가 string literal일 때만 반환 타입을 자동 추론한다. 현재 여러 service 파일에서 select 컬럼 목록을 배열로 정의한 뒤 `.join(', ')`으로 합쳐 넘기고 있어, TypeScript가 반환 타입을 추론하지 못한다. 이로 인해 `as unknown as SomeRow` 강제 캐스팅이 사용되고 있어, select 컬럼 변경 시 타입 오류를 컴파일 타임에 감지할 수 없다.

- 문제:
  `as unknown as` 패턴이 아래 4개 service 파일에 총 12건 존재한다:
  - `src/app/api/products/_lib/service.ts` (3건)
  - `src/app/api/seller/products/_lib/service.ts` (5건)
  - `src/app/api/seller/menu-items/_lib/service.ts` (3건)
  - `src/app/api/categories/_lib/service.ts` (1건)

- 작업 내용:
  - 각 service 파일의 select 컬럼 배열을 string literal 상수로 전환하거나, DB 결과 경계에 Zod 검증을 추가한다.
  - string literal 방식: `as const` template literal 또는 단일 string literal로 변환하여 Supabase 타입 추론이 동작하도록 한다.
  - Zod 방식: mapper 진입 전 결과를 Zod 스키마로 파싱하여 런타임 타입 안전성을 확보한다.
  - `as unknown as` 캐스팅 12건을 모두 제거한다.
  - `tsc --noEmit`, `npm run lint`, `npm run test` 통과를 확인한다.

- 관련 파일/영역:
  - `src/app/api/products/_lib/service.ts`
  - `src/app/api/seller/products/_lib/service.ts`
  - `src/app/api/seller/menu-items/_lib/service.ts`
  - `src/app/api/categories/_lib/service.ts`

- 예상 난이도:
  중간

- 완료 기준:
  - `as unknown as` 캐스팅이 위 4개 파일에서 완전히 제거된다.
  - select 컬럼 변경 시 컴파일 타임 타입 오류가 발생한다.
  - `tsc --noEmit`, lint, test 통과.
