# T17. dev-test route 제거 또는 dev-only guard

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P1

- 선행 조건:
  - 선행 task: 없음

- 분류:
  보안

- 사용자 흐름:
  Shared

- 주 담당 역할:
  Architecture

- 보조 역할:
  Shared-FE

- 배경:
  `src/app/(consumer)/dev-test/page.tsx`가 실제 route tree에 포함되어 있고, `apiClient`로 내부 API를 직접 호출한다.

  Harness 관점 (H4): 제품 route tree 안에 하네스 도구가 섞여 있어 배포 환경에 노출될 수 있다. "컴포넌트는 API client 직접 호출 금지" 규칙의 예외가 제품 route 안에 남아 있는 구조 드리프트다.

- 문제:
  배포 환경에서 접근 가능하면 내부 API 동작과 mock/real 정책이 노출될 수 있다.

- 작업 내용:
  - route를 제거하거나 development 환경에서만 접근 가능하도록 guard한다.
  - 필요한 테스트 기능은 Storybook, Playwright, dev script 중 적절한 위치로 이동한다.
  - page/component에서 `apiClient` 직접 호출 예외를 제거한다.

- 관련 파일/영역:
  - `src/app/(consumer)/dev-test/page.tsx`
  - `src/api/apiClient.ts`

- 예상 난이도:
  낮음

- 완료 기준:
  - production 환경에서 dev-test page에 접근할 수 없다.
  - 필요한 개발 검증 경로가 대체 위치에 있다.
