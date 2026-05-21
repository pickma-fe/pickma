# T14. seller/admin role-aware route guard 개선

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

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
