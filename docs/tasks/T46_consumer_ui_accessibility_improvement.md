# T46. Consumer UI/UX 및 접근성 개선

- 상태:
  완료

- GitHub Issue:
  278

- 우선순위:
  P2

- 선행 조건:
  - 선행 task: T45. UI/UX 및 접근성 baseline 기준 수립, T64. 공통 컴포넌트 접근성 baseline 적용, T65. 도메인 컴포넌트 폴더 구조 통일, T12. 공개 상품 목록 Server Component 초기 데이터 전환, T13. 상품 상세 Server Component 초기 데이터 전환

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
  - 홈/상품 목록/상품 상세/주문/마이페이지 화면을 `docs/ui_accessibility_baseline.md` 기준으로 점검한다(컴포넌트 접근성, UI 상태, 반응형, 시각 품질, UX 완성도, 기존 UI 보완 포함).
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
  - Consumer 주요 화면이 `docs/ui_accessibility_baseline.md` 기준으로 점검되고 개선된다.
  - 상품 탐색부터 주문 진입까지 주요 CTA와 상태 표시가 일관된다.
  - desktop/tablet(768–1024px)/mobile(375–430px) viewport에서 주요 텍스트와 UI 요소가 겹치거나 잘리지 않음을 수동 검증한다.
  - 필요한 후속 개선이 별도 task 또는 확인 필요 항목으로 분리된다.

- 구현 결과:
  - 1단계: consumer shell route group(`(consumer-shell)`) 생성, ConsumerHeader/Footer 레이아웃 공유 shell로 이전.
  - 2단계: Header 모바일 반응형 햄버거 드로어 추가.
  - 3단계: 홈 페이지 필터 칩 전환 및 접근성 개선.
  - 4단계: 검색 페이지 필터 칩 전환 및 위치 기반 검색 통합.
  - 5단계: 상품 상세 접근성 및 로딩 UI(`loading.tsx`) 개선.
  - 6단계: 주문 페이지 접근성 및 로딩 UI(`loading.tsx`) 개선.
  - 7단계: 마이페이지 모바일 탭(`MypageSidebar`), 예약 목록 빈 상태 CTA·탭 스타일 수정, 프로필 페이지 모바일 overflow 수정, 요약 패널 `xl` 이상에서만 노출, `mypage/loading.tsx` 신규.
  - 부가 수정: 전역 `Footer` 상단 여백 축소, consumer 페이지 전반의 `min-h-screen` 중복 제거(shell layout과의 높이 누적 문제 해결).

- 검증 결과:
  - 각 단계 변경 파일 기준 TypeScript(`tsc --noEmit`), ESLint 통과.
  - desktop/tablet/mobile viewport 수동 검증(홈, 검색, 상품 상세, 주문, 마이페이지) 완료.
