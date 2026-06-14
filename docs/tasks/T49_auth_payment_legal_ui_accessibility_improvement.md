# T49. Auth/Payment/Legal UI/UX 및 접근성 개선

- 상태:
  완료

- GitHub Issue:
  271

- 우선순위:
  P2

- 선행 조건:
  - 선행 task: T45. UI/UX 및 접근성 baseline 기준 수립, T64. 공통 컴포넌트 접근성 baseline 적용, T65. 도메인 컴포넌트 폴더 구조 통일, T27. Auth 이메일/Supabase SMTP/rate limit 정책 정리, T42. 법적 고지 페이지 및 동의 흐름 구현

- 분류:
  UI

- 사용자 흐름:
  Shared

- 주 담당 역할:
  Shared-FE

- 보조 역할:
  Consumer-FE, Domain, QA

- 배경:
  Auth, Payment, Legal 화면은 Consumer/Seller/Admin 흐름을 가로지르는 핵심 경계 화면이다. 로그인, 회원가입, 비밀번호 재설정, 결제 성공/실패, 약관/개인정보 페이지는 오류 상황과 법적 고지까지 포함하므로 접근성과 명확한 안내가 중요하다.

- 문제:
  인증과 결제 화면에서 form label, error message, redirect/loading 상태, 실패 복구 CTA가 불명확하면 사용자가 계정 생성이나 결제를 완료하지 못할 수 있다. 법적 고지 페이지는 긴 문서 구조와 링크 탐색 접근성도 함께 고려해야 한다.

- 작업 내용:
  - auth, payment, legal 화면을 `docs/ui_accessibility_baseline.md` 기준으로 점검한다(컴포넌트 접근성, UI 상태, 반응형, 시각 품질, UX 완성도, 기존 UI 보완 포함).
  - 로그인/회원가입/비밀번호 재설정 form의 label, validation, error, focus 처리를 점검한다.
  - 결제 성공/실패/checkout 화면의 loading, 실패 복구 CTA, query parameter 오류 상태를 점검한다.
  - 개인정보처리방침/이용약관 페이지의 heading 구조, link, 모바일 가독성을 점검한다.
  - T27, T42, T23 구현 범위와 겹치는 개선은 해당 task와 조정한다.
  - Supabase 비밀번호 재설정 이메일 템플릿을 한국어로 커스터마이징한다.

- 관련 파일/영역:
  - `src/app/auth/**`
  - `src/app/payment/success/page.tsx`
  - `src/app/payment/fail/page.tsx`
  - `src/app/payment/toss-checkout/page.tsx`
  - `src/app/privacy-policy/page.tsx`
  - `src/app/terms/page.tsx`
  - `src/components/auth/**`
  - `src/components/payment/**`

- 예상 난이도:
  중간

- 완료 기준:
  - Auth/Payment/Legal 주요 화면이 `docs/ui_accessibility_baseline.md` 기준으로 점검되고 개선된다.
  - 인증 form과 결제 결과 화면의 error/loading/retry 흐름이 명확하다.
  - 법적 고지 페이지가 heading 구조, link, 모바일 가독성 기준을 만족한다.
  - desktop/tablet(768–1024px)/mobile(375–430px) viewport에서 주요 화면을 수동 검증한다.
  - 필요한 후속 개선이 별도 task 또는 확인 필요 항목으로 분리된다.

- 구현 결과:
  - `Input`: `required` prop 추가 — label에 필수 `*` 표시, `aria-required` 자동 전달
  - `AuthModal`: login/signup/reset form에 `autoComplete`, `aria-required`, `role="alert"/"status"` live region 적용
  - `reset-password/page.tsx`: `?code=` 파라미터 없는 직접 접근 차단(만료 화면), `autoComplete` 추가
  - `PaymentSuccessClient`, `toss-checkout/page.tsx`: `return null` → `role="status"` 로딩 UI
  - `payment/fail/page.tsx`: Toss `code` 기반 취소/실패 문구 분기 + `reason` postMessage 전달로 `OrderFailPage` 연결
  - `terms/page.tsx`, `privacy-policy/page.tsx`: 섹션 `id` + `<nav id="toc">` 목차 + `<h2>` → `<a href="#toc">` 링크
  - `supabase/templates/reset-password.html`: 한국어 비밀번호 재설정 이메일 템플릿 (브랜드 그린 `#1e8e50`)
  - `email-service.ts`: OTP 이메일 인라인 HTML 브랜드 테마 적용
  - `Footer/BrandSection.tsx`: 앱스토어 뱃지 `next/image` 자연 치수로 비율 경고 수정
  - `MockUserSwitcher`: 접기/펼치기, Seller 매장 유무 분기(`seller_no_store`), hydration 오류 수정(`useSyncExternalStore`)

- 검증 결과:
  - `npx tsc --noEmit` 통과
  - `npm run lint` 통과
  - `npx vitest run src/hooks/payments/usePayment.test.ts` 통과 (9 tests)
  - `supabase config push` 완료 (원격 이메일 템플릿 반영)
