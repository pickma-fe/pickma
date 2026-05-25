# T47. Seller UI/UX 및 접근성 개선

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P2

- 선행 조건:
  - 선행 task: T45. UI/UX 및 접근성 baseline 기준 수립, T28. 판매자 상품 수정 진입점 결정 및 구현, T29. 판매자 제출 문서 확인 UX 개선, T38. 판매자 랜딩/온보딩 CTA 정리

- 분류:
  UI

- 사용자 흐름:
  Seller

- 주 담당 역할:
  Seller-FE

- 보조 역할:
  Shared-FE, QA

- 배경:
  Seller 흐름은 판매자 등록, 가게 관리, 상품/메뉴 관리, 주문 관리를 포함한다. 운영 도구 성격이 강하므로 반복 업무에 적합한 밀도, 상태 표시, form 접근성, table/list 탐색성이 중요하다.

- 문제:
  판매자 화면의 form, table/list, 상태 badge, CTA, error/empty 상태가 일관되지 않으면 입점과 운영 업무가 어렵고, 심사/주문 처리 같은 핵심 작업에서 실수가 발생하기 쉽다.

- 작업 내용:
  - 판매자 홈, 상품/메뉴/가게/주문/등록 화면을 T45 체크리스트로 점검한다.
  - form label, validation message, file upload, disabled state, focus 이동을 점검한다.
  - table/list의 정렬, 필터, 빈 상태, 행 action, 모바일 표시를 점검한다.
  - T29 판매자 제출 문서 확인 UX와 T38 판매자 랜딩/온보딩 CTA 흐름과 충돌하지 않게 개선 범위를 조정한다.
  - 필요한 Storybook 상태 또는 Playwright 시나리오 보강 범위를 정리한다.

- 관련 파일/영역:
  - `src/app/(seller)/seller/page.tsx`
  - `src/app/(seller)/seller/products/page.tsx`
  - `src/app/(seller)/seller/menu/page.tsx`
  - `src/app/(seller)/seller/store/page.tsx`
  - `src/app/(seller)/seller/orders/page.tsx`
  - `src/app/(seller)/seller/register/page.tsx`
  - `src/components/seller/**`

- 예상 난이도:
  중간

- 완료 기준:
  - Seller 주요 화면이 T45 checklist 기준으로 점검되고 개선된다.
  - 등록/운영 form의 label, validation, focus, error 상태가 접근성 기준을 만족한다.
  - 주문/상품/메뉴/가게 관리 화면의 list/table 상태가 일관된다.
  - 필요한 후속 개선이 별도 task 또는 확인 필요 항목으로 분리된다.
