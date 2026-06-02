# PickMa Agent 지침

## 프로젝트 맥락

PickMa는 마감 기한이 가까운 할인 상품을 예약하고 픽업할 수 있는 웹 플랫폼이다.

기술 스택:

- Next.js 16 App Router
- TypeScript
- Tailwind CSS and Headless UI
- Zustand
- TanStack Query
- Supabase Auth, Database, and Storage
- Toss Payments 직접 연결, `PAYMENT_MOCK` 환경변수로 mock/real 결제 분기
- Zod
- Vitest, Playwright, and Storybook

사용자 유형:

- Consumer: 상품 탐색, 예약, 결제
- Seller: 매장, 상품, 주문 관리
- Admin: 매장 승인과 플랫폼 관리

## Codex 세부 지침 파일

Codex로 코드 변경을 진행하기 전에는 관련 파일을 먼저 읽는다.

- TypeScript, React, styling, import, naming 규칙: `.codex/instructions/coding-style.md`
- 구현 범위와 작업 방식: `.codex/instructions/implementation.md`
- 커밋 또는 커밋 메시지 준비: `.codex/instructions/commit.md`

## Repository 명령어

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run e2e
npm run storybook
```

## Build 검증 정책

- 변경 범위에 맞는 검증을 선택한다.
- 환경이 지원하면 targeted test, `npm run test`, `npm run lint`, TypeScript check, build 검증을 적절히 사용한다.
- 로컬 전용 명령 제한은 공유 프로젝트 지침이 아니라 gitignored 로컬 지침 파일에 둔다.

## Git과 임시 파일

- 공유 task 원본은 `docs/tasks/`에서 관리한다.
- task 상태는 `진행 전`, `진행 중`, `완료`, `변경됨`만 사용한다.
- task 관련 GitHub Issue는 task 문서의 `GitHub Issue`에 번호만 기록한다.
- `temp/`는 로컬 계획, 체크포인트, 리뷰, agent 인계 메모에만 사용한다.
- task 기반 `temp/` 산출물은 파일명 맨 앞에 task ID를 둔다. 예: `temp/T02-plan.md`, `temp/T02-code-review.md`, `temp/T02-checkpoint.md`
- `temp/` 파일은 commit, push, PR 대상에 포함하지 않는다.
- 사용자가 명시적으로 요청하지 않으면 `temp/*`, `AGENTS.override.md`, `CLAUDE.local.md`, `.claude/settings.local.json`, 로컬 IDE 파일처럼 ignored 된 파일을 force-add하지 않는다.
- commit 또는 push 전에는 `git status --short`를 확인하고 로컬 메모, 생성 로그, 임시 산출물을 제외한다.

## 아키텍처 규칙

다음 import 방향을 지킨다.

```text
types -> contracts
contracts -> mocks
types -> lib -> api -> stores -> hooks -> components -> app
```

하위 layer는 상위 layer를 import하지 않는다.
Domain 로직이 들어가는 layer는 `contracts`를 직접 import하지 않는다.

핵심 아키텍처 문서:

- runtime architecture, API layer, auth/session, mock, payment flow: `docs/system_architecture.md`
- Domain Type, Contract DTO, Date, status, mapper 규칙: `docs/type_architecture.md`
- 구체적인 app Domain Type 정의: `docs/domain.md`
- API envelope, endpoint, validation, error code, priority: `docs/api_spec.md`

구현 규칙:

- Supabase DB 접근은 `src/api` -> `/api/*` Route Handler -> Supabase 흐름을 거친다.
- Supabase Auth는 component에서 직접 호출하지 않고 auth API wrapper를 통해 SDK를 사용한다.
- API contract DTO는 `src/contracts`, app Domain type은 `src/types`에 둔다.
- Contract date는 ISO string을 사용하고, Domain date는 client mapping 이후 `Date`를 사용할 수 있다.
- Server state는 TanStack Query hook에 두고, Zustand는 client/UI state에 사용한다.
- `src/lib`에는 framework/backend와 분리 가능한 domain/shared library만 둔다.
- Route Handler 전용 backend helper는 `src/app/api/_lib` 또는 `src/app/api/{resource}/_lib` 아래에 둔다.
- Route Handler helper 파일(`service.ts`, `mapper.ts`, `schemas.ts`)은 resource folder 내부 `_lib/` 아래에 둔다. 파일명 자체에는 `_` prefix를 붙이지 않는다.
- Storage cleanup 또는 민감 파일 처리 변경 시 `docs/system_architecture.md`의 Storage lifecycle 정책을 확인하고, client best-effort cleanup과 서버 cleanup 책임을 분리한다.
- 판매자 신청 서류/KYC 변경 시 T44/T61 기준을 확인하고, 신분증 원본(`id_card`) 수집을 되살리지 않는다.
- real mode에서 501(`NOT_IMPLEMENTED`)을 반환하는 endpoint에 연결된 버튼/링크는 활성 상태로 운영 UI에 노출하지 않는다. 미구현 endpoint 목록과 정책은 `docs/api_spec.md` 13절을 참고한다.
