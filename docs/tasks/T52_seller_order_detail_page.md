# T52. 판매자 주문 상세 화면 구현

- 상태:
  완료

- GitHub Issue:
  185

- 우선순위:
  P1

- 선행 조건:
  - 선행 task: T02 (판매자 주문 관리 real API 연결)

- 분류:
  화면/UI

- 사용자 흐름:
  Seller

- 주 담당 역할:
  Frontend

- 보조 역할:
  API

- 배경:
  IA 정합성 확인 중 `/seller/orders/[id]` 경로가 미구현 상태임을 확인했다. 판매자 주문 목록에서 개별 주문 상세 진입이 불가능하다.

- 문제:
  판매자가 특정 주문의 상세 정보, 픽업 처리, 노쇼 처리를 수행할 화면이 없다.

- 작업 내용:
  - `/seller/orders/[id]` 페이지 구현
  - 주문 상세 정보 표시 (상품, 수량, 픽업 시간, 픽업 번호, 주문 상태)
  - 상태에 따른 처리 버튼 (접수/준비완료/픽업완료/노쇼)
  - 판매자+가게 권한 guard 및 본인 가게 주문 여부 검증

- 관련 파일/영역:
  - `src/app/(seller)/seller/orders/[id]/`
  - `src/api/seller/orders/` (주문 상세 및 상태 변경)
  - `src/hooks/seller/` (주문 상태 변경 훅)

- 예상 난이도:
  보통

- 완료 기준:
  - `/seller/orders/[id]` 화면이 주문 상세를 올바르게 표시한다.
  - 상태에 따른 처리 버튼이 정상 동작한다.

- 확인 필요 사항:
  - 주문 처리 버튼의 확인 모달 여부
  - 픽업번호 확인 UX (QR/입력 방식 등)

- 구현 결과:
  - `/seller/orders/[id]` 페이지와 `OrderDetailContent` 구현.
  - `useSellerOrder`로 주문 상세를 조회하고 상품, 수량, 픽업 시간, 픽업 번호, 주문 상태를 표시.
  - 상태별 액션으로 접수, 준비 완료, 픽업 완료, 미수령 처리를 연결.
  - `sellerOrderApi`, seller order hook, mapper, 테스트를 확장해 상세 조회와 상태 변경 흐름을 검증.
