# T14. seller/admin role-aware route guard 개선

- 상태:
  완료

- GitHub Issue:
  212

- 우선순위:
  P1

- 선행 조건:
  - 선행 task: T07. service role 사용 기준 및 owner scope 테스트 수립

- 분류:
  보안

- 사용자 흐름:
  Seller / Admin

- 주 담당 역할:
  Architecture

- 보조 역할:
  Seller-FE, Admin-FE

- 배경:
  `proxy.ts`는 seller/admin route에서 로그인 여부만 확인하고 role/store 검증은 API에 맡긴다.

- 문제:
  권한 없는 사용자가 페이지 shell까지 접근한 뒤 내부 fetch 실패로 오류 UX를 볼 수 있다.

- 작업 내용:
  - seller/admin layout에서 role-aware preload 또는 redirect를 추가한다.
  - 최종 보안 검증은 Route Handler에 유지한다.
  - 권한 오류 화면/redirect UX를 통일한다.

- 관련 파일/영역:
  - `src/proxy.ts`
  - `src/app/(seller)/seller/layout.tsx`
  - `src/app/(admin)/admin/layout.tsx`
  - `src/app/api/_lib/auth.ts`

- 예상 난이도:
  중간

- 완료 기준:
  - 비권한 사용자의 seller/admin 직접 URL 접근 UX가 안정적이다.
  - API 보안 검증과 page UX 검증의 책임이 문서화된다.

- 구현 결과:
  - `src/hooks/auth/useRoleGuard.ts` 신규 작성. `useMe()`를 내부 composition으로 호출해 `loading | ok | unauthorized | forbidden | error` 상태를 반환하며, `enabled=false`이면 role 판정과 auth 에러를 skip해 공개 라우트에서 redirect 루프 없이 동작한다.
  - `src/app/(seller)/seller/layout.tsx`에 path-aware role guard 적용. `SELLER_MANAGEMENT_PREFIXES` 기준으로 관리 라우트만 guard 대상으로 하고, register/pending 온보딩 라우트는 제외.
  - `src/app/(admin)/admin/layout.tsx`의 인라인 role 체크를 `useRoleGuard('admin')` 기반으로 정리. `guard.user!` non-null assertion을 제거하고 `RoleGuardResult`를 discriminated union으로 교체.
  - `src/hooks/auth/useRoleGuard.test.ts` 신규 작성. 10개 케이스로 loading, 401/403/5xx, role 불일치, enabled=false 공개 라우트 auth 에러 무시를 검증.
  - `docs/system_architecture.md`에 접근 제어 3계층(proxy → layout → Route Handler) 책임 분리 표 추가.
  - `.codex/instructions/coding-style.md`, `.claude/rules/coding-style.md`에 hooks 내 단방향 composition 허용 기준 명문화.
