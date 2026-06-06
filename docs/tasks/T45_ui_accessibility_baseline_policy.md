# T45. UI/UX 및 접근성 baseline 기준 수립

- 상태:
  완료

- GitHub Issue:
  238

- 우선순위:
  P1

- 선행 조건:
  - 선행 task: T09. 501 API 및 UI 노출 목록 정리

- 분류:
  UI

- 사용자 흐름:
  Shared

- 주 담당 역할:
  Shared-FE

- 보조 역할:
  Design, QA

- 배경:
  현재 task board에는 특정 기능 단위의 UI 개선은 있으나 Consumer, Seller, Admin, Auth, Payment 전체에 공통으로 적용할 UI/UX 및 접근성 baseline 기준이 없다.

- 문제:
  화면별로 loading/error/empty/disabled 상태, CTA 노출, form label, focus ring, keyboard navigation, 텍스트 overflow 기준이 다르면 사용자 흐름별 품질이 들쭉날쭉해지고 리뷰 기준도 모호해진다.

- 작업 내용:
  - 전 페이지 공통 UI/UX 점검 체크리스트를 정의한다.
  - 버튼, 링크, form control, table/list, modal/dialog, toast/alert의 접근성 기준을 정리한다.
  - 반응형 레이아웃, 터치 타깃, 색 대비, 텍스트 overflow, focus ring, keyboard navigation 기준을 정리한다.
  - loading/error/empty/disabled 상태와 CTA 우선순위 기준을 정리한다.
  - T09의 501 API 및 미구현 UI 노출 목록과 연결해 숨김, disabled reason, 준비 상태 처리 기준을 정한다.
  - 수동 체크리스트, Storybook 상태 보강, Playwright 시나리오 중 흐름별 검증 방식을 정한다.
  - `src/app/layout.tsx`에 `viewport-fit: cover`와 `lang="ko"`를 설정한다.
  - `src/app/globals.css`에 `@utility pb-safe`를 추가한다.

- 구현 결과:
  - `docs/ui_accessibility_baseline.md` 작성 완료 (10절 구성: 컴포넌트 접근성·UI 상태·반응형·시각 품질·UX·T64 debt·키보드 탐색·501 정책 참조·검증 방식·컴포넌트 위치 규칙)
  - `src/app/layout.tsx`: `viewport-fit: 'cover'` 추가, `lang="ko"` 버그 수정
  - `src/app/globals.css`: `@utility pb-safe` 추가
  - 후속 task: T64(공통 컴포넌트 접근성), T65(도메인 컴포넌트 폴더 통일), T66(Capacitor/PWA), T67(i18n)

- 관련 파일/영역:
  - `docs/tasks/T09_api_501_ui_exposure_inventory.md`
  - `docs/tasks/T23_e2e_payment_popup_mocking_strategy.md`
  - `src/components/**`
  - `src/app/**`

- 예상 난이도:
  낮음

- 완료 기준:
  - 사용자 흐름별 UI/UX 접근성 개선 task에서 재사용할 공통 체크리스트가 정리된다.
  - 미구현 기능 노출과 disabled 상태 처리 기준이 T09와 연결된다.
  - Storybook, Playwright, 수동 검증 중 어떤 검증을 적용할지 기준이 명확하다.
  - T46, T47, T48, T49가 이 기준을 선행 task로 참조한다.
