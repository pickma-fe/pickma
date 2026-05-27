# T46. Consumer UI/UX 및 접근성 개선

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P2

- 선행 조건:
  - 선행 task: T45. UI/UX 및 접근성 baseline 기준 수립, T12. 공개 상품 목록 Server Component 초기 데이터 전환, T13. 상품 상세 Server Component 초기 데이터 전환

- 분류:
  UI

- 사용자 흐름:
  Consumer

- 주 담당 역할:
  Consumer-FE

- 보조 역할:
  Shared-FE, QA

- 배경:
  Consumer 흐름은 상품 탐색, 상품 상세 확인, 주문, 마이페이지로 이어지는 핵심 구매 경험이다. T45에서 정의한 공통 UI/UX 및 접근성 baseline을 실제 consumer 화면에 적용해야 한다.

- 문제:
  상품 탐색과 주문 흐름에서 반응형 레이아웃, 로딩/빈 상태, CTA 우선순위, 미구현 기능 노출, keyboard navigation이 일관되지 않으면 예약 전환 과정에서 사용자가 이탈하기 쉽다.

- 작업 내용:
  - 홈/상품 목록/상품 상세/주문/마이페이지 화면을 T45 체크리스트로 점검한다.
  - loading/error/empty 상태와 상품 이미지 fallback, 가격/할인 정보 표시를 점검한다.
  - 주문 CTA, 품절/마감/준비 중 상태, disabled reason 표시 기준을 적용한다.
  - 모바일 viewport에서 텍스트 overflow, 터치 타깃, 하단 CTA 가림 여부를 확인한다.
  - 필요한 Storybook 상태 또는 Playwright 시나리오 보강 범위를 정리한다.

- 관련 파일/영역:
  - `src/app/(consumer)/page.tsx`
  - `src/app/(consumer)/products/[productId]/page.tsx`
  - `src/app/(consumer)/order/[productId]/page.tsx`
  - `src/app/(consumer)/mypage/page.tsx`
  - `src/components/consumer/**`
  - `src/hooks/products/**`

- 예상 난이도:
  중간

- 완료 기준:
  - Consumer 주요 화면이 T45 checklist 기준으로 점검되고 개선된다.
  - 상품 탐색부터 주문 진입까지 주요 CTA와 상태 표시가 일관된다.
  - desktop/mobile viewport에서 주요 텍스트와 UI 요소가 겹치거나 잘리지 않는다.
  - 필요한 후속 개선이 별도 task 또는 확인 필요 항목으로 분리된다.
