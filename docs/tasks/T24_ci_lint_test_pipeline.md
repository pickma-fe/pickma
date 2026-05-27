# T24. CI 기본 파이프라인 구축

- 상태:
  완료

- GitHub Issue:
  173

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
  Docs

- 배경:
  `.github/workflows`가 없어 `npm run lint`, `npm run test`가 로컬 명령으로만 존재한다.

  Harness 관점 (H1): 에이전트가 만든 PR을 자동 검증할 루프가 없다. import boundary, no-floating-promises, unit tests가 merge 전에 항상 실행된다는 보장이 없다. 하네스가 문서상 규칙에 머물고 저장소 수준 피드백 루프가 약하다.

- 문제:
  P0/P1 안정화 작업 후에도 회귀를 빠르게 잡기 어렵다.

- 작업 내용:
  - GitHub Actions workflow `.github/workflows/ci.yml`를 추가한다.
  - `npm run lint`, `npm run test`를 PR마다 자동 실행한다.
  - E2E는 T23 완료 후 별도 job으로 추가한다. 이 task에서는 포함하지 않는다.
  - Supabase env/mock mode secret 전략을 정리한다.
  - 로컬 Codex 환경에서는 `npm run build`를 실행하지 않지만, CI에서 build를 실행할지는 팀 결정이 필요하다.

- 구현 메모:
  - 기본 CI job은 `npm ci`, `npx playwright install --with-deps chromium`, `npm run lint`, `npm run typecheck`, `npm run test`를 실행한다.
  - `npm run test`에는 Storybook/Vitest browser project가 포함되어 Chromium 설치가 필요하다.
  - CI env는 외부 서비스에 연결하지 않는 mock/test placeholder 값을 사용한다.
  - `npm run build`는 초기 CI 필수 job에서 제외하고, 팀 결정 후 별도 job으로 추가한다.
  - E2E job은 T23 완료 후 추가한다.
  - branch protection은 GitHub UI에서 `CI / Lint, typecheck, and test` 필수 check로 설정한다.

- 관련 파일/영역:
  - `.github/workflows/ci.yml` (신규)
  - `package.json`
  - `docs/system_architecture.md`

- 예상 난이도:
  중간

- 완료 기준:
  - PR마다 lint/test가 자동 실행된다.
  - CI 통과 없이 merge하지 않는 branch protection 정책이 있다.
  - 필요한 env 문서가 있다.
  - E2E job은 T23 완료 후 추가되며, 이 task 완료 기준에 포함하지 않는다.
