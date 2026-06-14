# T75. 백엔드 전용 lib을 app/api/\_lib으로 분리

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
  Architecture

- 보조 역할:
  Shared-FE

- 배경:
  `src/lib/`은 FE/BE 공용 순수 로직을 담는 레이어로 설계됐으나, `AppError`처럼 Route Handler 전용으로만 쓰이는 백엔드 유틸이 섞여 있다. `lib/` 레이어는 `contracts/`를 import할 수 없어, `AppError`가 API 응답 타입인 `ValidationIssue`(`contracts/common`)를 import하는 규칙 위반이 발생해 있다.

- 문제:
  `src/lib/errors/appError.ts`가 `@/contracts/common`의 `ValidationIssue`를 import하며 `lib → contracts` 아키텍처 규칙을 위반한다. 근본 원인은 `AppError`가 백엔드 전용 클래스임에도 `lib/`에 위치한 것이다.

- 작업 내용:
  - `src/lib/`에서 백엔드 Route Handler 전용 유틸을 식별한다 (`AppError` 등).
  - 해당 유틸을 `src/app/api/_lib/`로 이동한다.
  - 이동된 파일을 import하는 Route Handler 서비스/핸들러의 import 경로를 일괄 수정한다.
  - `src/lib/`에는 FE/BE 공용 순수 로직만 남긴다.
  - 이동 후 `tsc --noEmit`, `npm run lint`로 규칙 위반 0건을 확인한다.

- 관련 파일/영역:
  - `src/lib/errors/appError.ts` → `src/app/api/_lib/appError.ts`
  - `src/app/api/**/_lib/service.ts` (AppError import 경로 수정)
  - `src/app/api/**/route.ts` (AppError import 경로 수정)
  - `src/app/api/_lib/response.ts` (AppError import 경로 수정)

- 예상 난이도:
  낮음

- 완료 기준:
  - `src/lib/`에 `contracts/`를 import하는 파일이 없다.
  - `AppError`가 `src/app/api/_lib/`에 위치하고, 모든 Route Handler에서 올바른 경로로 import된다.
  - `tsc --noEmit` 통과, lint 위반 없음.
