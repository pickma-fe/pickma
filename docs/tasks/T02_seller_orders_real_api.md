# T02. 판매자 주문 관리 real API 연결

- 상태:
  완료

- GitHub Issue:
  164

- 우선순위:
  P0

- 선행 조건:
  - 선행 task: 없음
  - 기타 조건: 주문 상태 전이 정책 확인

- 분류:
  기능

- 사용자 흐름:
  Seller

- 주 담당 역할:
  Seller-FE

- 보조 역할:
  Domain

- 배경:
  판매자 주문 Route Handler, client API, hook은 준비되어 있으나 UI가 mock 데이터를 직접 사용한다.

- 문제:
  판매자가 실제 주문을 확인하거나 처리할 수 없어 운영 플로우 검증이 불가능하다.

- 작업 내용:
  - `OrderManageContent.tsx`의 `@/mocks/orders` 의존을 제거한다.
  - `useSellerOrders()`를 연결한다.
  - `useAcceptSellerOrder`, `useMarkSellerOrderReady`, `useCompleteSellerOrder`를 주문 액션 버튼에 연결한다.
  - `no-show`는 endpoint 구현 상태에 따라 disabled reason 또는 미노출로 처리한다.
  - `OrderTable` props를 Contract DTO가 아닌 Domain 또는 화면 ViewModel로 정리한다.

- 관련 파일/영역:
  - `src/app/(seller)/seller/orders/_components/OrderManageContent.tsx`
  - `src/app/(seller)/seller/orders/_components/OrderTable.tsx`
  - `src/hooks/seller/orders/*`
  - `src/api/seller/orders/*`

- 예상 난이도:
  중간

- 완료 기준:
  - 판매자 주문 목록이 실제 API 데이터로 렌더링된다.
  - 주문 접수/준비 완료/픽업 완료가 성공/실패 상태를 표시한다.
  - UI에서 `@/mocks/orders`를 직접 import하지 않는다.
  - 관련 hook/component 테스트가 추가 또는 갱신된다.
