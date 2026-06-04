# T20. Route Handler `_lib` 횡단 import 정리

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P1

- 선행 조건:
  - 선행 task: 없음

- 분류:
  아키텍처

- 사용자 흐름:
  Shared

- 주 담당 역할:
  Architecture

- 보조 역할:
  Domain

- 배경:
  payments route가 orders `_lib/service`의 `expireUserOrders`를 직접 import한다.
  `seller/orders/_lib/mapper.ts`가 `orders/_lib/mapper`를 import한다.

  Harness 관점 (H6): ESLint 계층 rule은 통과해도 API resource 내부 private boundary는 드리프트할 수 있다. 에이전트가 비슷한 패턴을 복제할 가능성이 높다.

- 문제:
  resource 내부 `_lib` 간 ad-hoc 공유가 늘면 순환 의존과 테스트 mocking 비용이 커진다.

- 작업 내용:
  - 공유 로직을 `src/app/api/_lib/order-expiration.ts` 등 공통 API lib로 이동한다.
  - resource `_lib` 간 직접 import 금지 원칙을 문서화한다.
  - `src/lib`에 남아 있는 Route Handler 전용 backend helper가 있는지 확인하고, 필요한 경우 `src/app/api/_lib` 또는 resource-local `_lib`로 옮긴다.
  - `src/lib`에는 framework/backend와 분리 가능한 domain/shared library만 두는 기준을 문서화한다.
  - ESLint `import/no-restricted-paths` 또는 CI `rg` check로 resource `_lib` 횡단 import를 기계적으로 금지한다 (Harness H6).
  - `eslint.config.mjs`의 글로벌 block과 mock outbound block에 중복된 layer zones 배열을 공통 상수로 분리한다 (T18 코드리뷰 Suggestions).
  - 관련 테스트 import 경로를 갱신한다.

- 관련 파일/영역:
  - `src/app/api/payments/prepare/route.ts`
  - `src/app/api/payments/confirm/route.ts`
  - `src/app/api/orders/_lib/service.ts`
  - `src/app/api/_lib/*`

- 예상 난이도:
  낮음

- 완료 기준:
  - payments route가 orders resource private `_lib`를 직접 import하지 않는다.
  - 공통 API lib 위치와 사용 기준이 명확하다.
  - Route Handler 전용 backend helper가 `src/lib`에 새로 추가되지 않는 기준이 명확하다.
  - lint 또는 CI check로 resource `_lib` 횡단 import가 자동 감지된다.
