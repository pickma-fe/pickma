# T64. 공통 컴포넌트 접근성 baseline 적용

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P1

- 선행 조건:
  - 선행 task: T45. UI/UX 및 접근성 baseline 기준 수립

- 분류:
  UI

- 사용자 흐름:
  Shared

- 주 담당 역할:
  Shared-FE

- 보조 역할:
  QA

- 배경:
  T45에서 공통 UI/UX 및 접근성 baseline 기준(`docs/ui_accessibility_baseline.md`)이 수립됐다. T46~T49에서 도메인별 화면에 baseline을 적용하기 전에, `src/components/common/**`의 공통 컴포넌트가 baseline을 먼저 충족해야 한다. 현황 파악 결과, 공통 Button은 `ButtonHTMLAttributes`를 확장하므로 `aria-label` 전달 자체는 가능하나 아이콘 전용 Button 사용처의 accessible name 누락 여부는 미확인 상태다. Pagination과 Footer의 focus ring 미적용, Badge의 aria 속성 부재, Modal의 aria-modal 명시 누락도 확인됐다.

- 문제:
  공통 컴포넌트에 접근성 기준이 빠져 있으면 T46~T49에서 도메인 화면을 점검해도 공통 컴포넌트에서 동일한 문제가 반복된다. T65(도메인 컴포넌트 폴더 통일)보다 먼저 처리해야 이동 후에도 접근성 기준이 유지된다.

- 작업 내용:
  - Button: 아이콘 전용 Button 사용처를 찾아 accessible name(`aria-label` 또는 `aria-labelledby`) 누락 여부를 점검하고, 누락된 곳을 수정한다. story/usage 기준을 정의한다.
  - Pagination: 각 페이지 버튼과 이전/다음 버튼에 `focus-visible:ring-2` 스타일을 적용한다.
  - Footer: 모든 링크에 `focus-visible:ring-2` 스타일을 적용한다.
  - Badge: 상태 배지에 `role="status"` 또는 의미 전달용 `aria-label`을 추가한다. 순수 장식적 Badge는 적용 제외.
  - Modal: `aria-modal="true"` 명시 여부를 검토하고 Headless UI Dialog 기준에 따라 적용 또는 이유를 기록한다.
  - 각 공통 컴포넌트에 Storybook story를 보강한다: disabled, loading, empty, error 상태 story를 최소 한 가지 이상 추가한다.
  - desktop/tablet(768–1024px)/mobile(375–430px) viewport에서 focus ring 시각 확인과 aria 속성 적용을 수동 검증한다.

- 관련 파일/영역:
  - `src/components/common/Button/Button.tsx`, `Button.stories.tsx`
  - `src/components/common/Pagination/Pagination.tsx`, `Pagination.stories.tsx`
  - `src/components/common/Footer/Footer.tsx`, `Footer.stories.tsx`
  - `src/components/common/Badge/Badge.tsx`, `Badge.stories.tsx`
  - `src/components/common/Modal/Modal.tsx`, `Modal.stories.tsx`

- 예상 난이도:
  낮음~중간

- 완료 기준:
  - `src/components/common/**`의 Button, Pagination, Footer, Badge, Modal이 `docs/ui_accessibility_baseline.md` 1·3·4절 기준을 만족한다.
  - 아이콘 전용 Button 사용처의 accessible name 누락 여부가 점검되고 수정된다. story/usage 기준이 정의된다.
  - Pagination과 Footer 링크에 `focus-visible:ring-2` 스타일이 적용된다.
  - 상태 Badge에 `role="status"` 또는 `aria-label`이 적용된다.
  - 각 공통 컴포넌트에 Storybook 상태 story가 보강된다.
  - desktop/tablet/mobile viewport에서 수동 검증이 완료된다.
  - T65와 T46~T49가 이 task를 선행 조건으로 참조한다.
