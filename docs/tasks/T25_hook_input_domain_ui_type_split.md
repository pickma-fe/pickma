# T25. hook input Domain/UI 타입 분리

- 상태:
  완료

- GitHub Issue:
  252

- 우선순위:
  P2

- 선행 조건:
  - 선행 task: T15. TanStack Query key 및 invalidation factory 도입

- 분류:
  아키텍처

- 사용자 흐름:
  Shared

- 주 담당 역할:
  Shared-FE

- 보조 역할:
  Domain

- 배경:
  일부 hook이 Contract request 타입을 그대로 입력으로 노출한다.

- 문제:
  화면/form state와 API DTO 경계가 약해져 추천/검색/개인화 확장 시 Domain 오염이 커질 수 있다.

- 작업 내용:
  - mutation hook부터 UI input 타입을 정의한다.
  - API 호출 직전에 Contract DTO로 변환한다.
  - query params는 변경 위험이 낮은 것부터 단계적으로 정리한다.

- 관련 파일/영역:
  - `src/hooks/products/useProducts.ts`
  - `src/hooks/orders/useCreateOrder.ts`
  - `src/hooks/payments/useConfirmPayment.ts`
  - `src/hooks/seller/products/*`
  - `src/contracts/*`

- 예상 난이도:
  중간

- 완료 기준:
  - 주요 mutation hook 외부 props가 Contract DTO에 직접 결합되지 않는다.
  - 변환 책임이 API boundary에 위치한다.

- 구현 결과:
  - `src/types/*`에 주문 생성, 결제 확인, 상품 목록 query, 판매자 상품 생성/수정, 메뉴 생성/수정, 스토어 생성/수정, 사용자 정보 수정, 판매자 신청 입력 타입을 추가했다.
  - `src/hooks/**`의 주요 mutation/query 입력에서 Contract request 타입 직접 노출을 제거하고 Domain/UI 타입을 사용하도록 정리했다.
  - `src/api/**` client wrapper에서 Domain/UI 입력을 Contract DTO로 변환한 뒤 request body/query로 전달하도록 이동했다.
  - Date 기반 입력(`pickupAt`, `endAt`)은 API boundary에서 ISO string으로 변환하도록 고정했다.
  - 주문/결제/판매자 상품/스토어 API 테스트와 관련 hook 테스트로 변환 경로를 검증했다.
