# T23. E2E 테스트 및 결제 팝업 모킹 전략

- 상태:
  완료

- GitHub Issue:
  298

- 우선순위:
  P3

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

- 구현 결과:
  - `e2e/example.spec.ts` 제거 완료
  - `playwright.config.ts`: public/auth-setup/consumer/seller/admin project 분리, workers=1, screenshot/trace, dotenv .env.e2e 로드
  - `e2e/smoke.spec.ts`: 홈 상품 목록 + 상품 상세 진입 smoke (public project)
  - `e2e/auth.setup.ts`: consumer/seller/admin 계정 로그인 → /api/users/me role/status 검증 → storage state 저장
  - `e2e/fixtures/auth.ts`: consumerPage/sellerPage/adminPage fixture
  - `e2e/helpers/payment.ts`: waitForPaymentPopupAndComplete helper
  - `e2e/consumer-order.spec.ts`: 상품 상세 → 픽업 슬롯 선택 → 주문 → 결제 팝업 → /order/complete
  - `e2e/seller-orders.spec.ts`: 판매자 주문 목록 진입 및 seed 주문 확인
  - `e2e/admin-approval.spec.ts`: 관리자 판매자 승인 페이지 접근 및 버튼 확인
  - `supabase/seeds/e2e-auth.sql`: consumer/seller password 설정, admin 신규 계정 생성
  - `supabase/seeds/e2e-data.sql`: E2E 전용 product, seller-orders 주문/결제 seed, admin-approval pending 신청 seed, cleanup 블록
  - `.github/workflows/ci.yml`: e2e job 추가 (supabase start/reset/seed → env export → npm run e2e → artifact upload)
  - `package.json`: dotenv, supabase devDependency 추가
  - `.env.e2e.example`: E2E 환경변수 예시 파일
