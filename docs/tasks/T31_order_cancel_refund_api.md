# T31. 주문 취소/환불 API 구현

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P3

- 선행 조건:
  - 선행 task: T11. 결제 outbox/webhook/idempotency 설계, T02. 판매자 주문 관리 real API 연결

- 분류:
  기능

- 사용자 흐름:
  Customer / Admin

- 주 담당 역할:
  Domain

- 보조 역할:
  Customer-FE, Admin-FE

- 배경:
  주문 취소와 결제 취소 endpoint는 stub 또는 미구현 상태다.

- 문제:
  실서비스에서 고객 취소/환불 요청을 수동으로 처리해야 한다.

- 작업 내용:
  - 취소 가능 상태와 시간 정책을 정한다.
  - `PATCH /api/orders/:id/cancel`, `POST /api/payments/:id/cancel`을 구현한다.
  - Toss cancel API 연동과 재고 복구를 atomic하게 처리한다.
  - 고객/관리자 UI에 취소/환불 상태를 표시한다.

- 관련 파일/영역:
  - `src/app/api/orders/[orderId]/cancel/route.ts`
  - `src/app/api/payments/[paymentId]/cancel/*`
  - `src/hooks/orders/useCancelOrder.ts`
  - `src/hooks/payments/useCancelPayment.ts`

- 예상 난이도:
  높음

- 완료 기준:
  - 고객 또는 운영자가 정책에 맞게 주문/결제를 취소할 수 있다.
  - 재고와 결제 상태가 불일치하지 않는다.
  - `PATCH /api/orders/{orderId}/cancel`, `POST /api/payments/{paymentId}/cancel` endpoint가 구현되고 `NOT_IMPLEMENTED` 반환 코드가 제거된다.
