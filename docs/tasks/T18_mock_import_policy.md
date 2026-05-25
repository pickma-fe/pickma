# T18. mock import 금지 기준 정리

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P1

- 선행 조건:
  - 선행 task: 없음

- 분류:
  테스트

- 사용자 흐름:
  Shared

- 주 담당 역할:
  Architecture

- 보조 역할:
  Shared-FE, Docs

- 배경:
  Route Handler mock fixture와 UI가 직접 사용하는 mock이 `src/mocks`에서 섞여 있다.

- 문제:
  real API 전환 후에도 UI가 mock을 직접 import할 위험이 남는다.

- 작업 내용:
  - 앱 코드에서 `@/mocks` import 금지 기준을 정한다.
  - 필요한 fixture는 story/test 또는 Route Handler mock 전용 위치로 이동한다.
  - `rg` 기반 CI check 또는 ESLint `no-restricted-imports` rule로 app/component 파일의 `@/mocks` 직접 import를 자동 감지한다.

- 관련 파일/영역:
  - `src/mocks/*`
  - `src/app/**/*`
  - `src/components/**/*`
  - `src/**/*.stories.tsx`
  - `src/**/*.test.ts`

- 예상 난이도:
  낮음

- 완료 기준:
  - production app route/component에서 `@/mocks` 직접 import가 없다.
  - mock 사용 위치 기준이 문서화된다.
  - lint rule 또는 CI check로 위반이 자동 감지된다.
