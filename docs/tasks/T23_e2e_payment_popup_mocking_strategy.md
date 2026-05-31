# T23. E2E 테스트 및 결제 팝업 모킹 전략

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P2

- 선행 조건:
  - 선행 task: T01. 결제 confirm 보상 정책 확정, T02. 판매자 주문 관리 real API 연결, T03. 관리자 판매자 승인 화면 구현, T04. 관리자 가게 목록 real endpoint 및 화면 구현, T24. CI 기본 파이프라인 구축

- 분류:
  테스트

- 사용자 흐름:
  Customer / Seller / Admin

- 주 담당 역할:
  Architecture

- 보조 역할:
  Customer-FE, Seller-FE, Admin-FE

- 배경:
  현재 단위 테스트는 있으나 핵심 사용자 흐름 E2E가 없다.
  `e2e/example.spec.ts`는 `https://playwright.dev/`를 테스트하며 PickMa 앱 검증과 무관하다.

  Harness 관점 (H2): `npm run e2e`가 성공해도 PickMa의 고객/판매자/관리자 흐름은 검증되지 않는다. 결제 팝업, 관리자 승인, 판매자 주문 처리 같은 핵심 regression을 잡지 못한다.

- 문제:
  결제 팝업, 판매자 주문 처리, 관리자 승인 같은 교차 흐름이 회귀 테스트로 보호되지 않는다.

- 작업 내용:
  - 첫 작업으로 `e2e/example.spec.ts`를 제거하고 PickMa smoke E2E를 추가한다.
  - 최소 smoke 시나리오를 우선 추가한다:
    - 고객 홈 진입 및 상품 목록 표시
    - 상품 상세/주문 진입
    - 판매자 주문 목록 진입
    - 관리자 승인 페이지 접근
  - Playwright 테스트 대상 핵심 시나리오를 선정한다.
  - 결제 팝업 `window.open`과 `postMessage` 모킹 전략을 별도 helper로 작성한다.
  - 고객 주문/결제, 판매자 주문 처리, 관리자 승인 E2E를 추가한다.
  - seed/mock mode 전환 정책을 테스트와 맞춘다.
  - E2E 안정화 후 CI workflow에 E2E job을 추가할 후속 작업을 문서화한다.

- 관련 파일/영역:
  - `e2e/example.spec.ts` (제거 대상)
  - `playwright.config.*`
  - `src/hooks/payments/usePayment.ts`
  - `src/app/(consumer)/order/*`
  - `src/app/(seller)/seller/orders/*`
  - `src/app/(admin)/admin/sellers/pending/*`

- 예상 난이도:
  높음

- 완료 기준:
  - `e2e/example.spec.ts`가 제거된다.
  - 핵심 3개 이상 E2E 시나리오가 자동화된다.
  - 결제 팝업 모킹 방식이 안정적으로 동작한다.
  - 실패 시 CI에서 원인을 파악할 trace/screenshot 설정이 있다.
  - CI workflow에 E2E job을 추가하기 위한 후속 작업이 명확하다.
