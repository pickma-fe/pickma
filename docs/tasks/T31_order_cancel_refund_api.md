# T31. 주문 취소/환불 API 구현

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P1

- 선행 조건:
  - 선행 task: T11. 결제 outbox/webhook/idempotency 설계, T02. 판매자 주문 관리 real API 연결, T62. payment_events 테이블 migration 및 이벤트 contract 구현

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
  - 1차 범위는 사용자/운영자 전액 주문 취소로 제한한다.
  - `PATCH /api/orders/:id/cancel`을 대표 사용자 액션 API로 구현한다.
  - `POST /api/payments/:id/cancel`은 외부 결제 보상/운영 도구용 low-level API로 남기거나 1차에서는 admin/service 전용으로 제한한다.
  - `reserved` 상태는 고객 self-service 취소를 허용하고, `accepted` 이후 상태는 운영자 또는 판매자/관리자 승인 취소로 제한한다.
  - `ready`, `completed`, `no_show`, `expired`, `cancelled`는 자동 취소 대상에서 제외하고 후속 운영/클레임 정책으로 분리한다.
  - `processing` 상태는 결제 confirm gap 상태로 보고 일반 사용자 취소 대상에서 제외한다.
  - Toss cancel API 연동과 재고 복구를 `DB claim -> Toss cancel -> DB finalize` 흐름으로 처리한다.
  - finalize RPC에서 주문/결제 상태 변경, 재고 복구, `payment_cancelled` 이벤트 기록을 atomic하게 처리한다.
  - Toss cancel 성공 후 finalize 실패는 운영 알람 대상 이벤트로 남긴다.
  - 취소 완료 시 `payment_cancelled` 이벤트를 `payment_events`에 atomic하게 기록한다 (T62 완료 전제).
  - 고객/관리자 UI에 취소/환불 상태를 표시한다.
  - 부분 환불, 판매자 귀책/고객 귀책 수수료, 정산 차감, pickup 이후 클레임 환불은 T32 또는 별도 후속 task로 분리한다.

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
  - `payment_cancelled` 이벤트가 결제/주문 취소 확정과 함께 기록된다.
  - `store_order_number`, `pickup_number`, sequence는 취소 후에도 회수하지 않는다.
  - `PATCH /api/orders/{orderId}/cancel`, `POST /api/payments/{paymentId}/cancel` endpoint가 구현되고 `NOT_IMPLEMENTED` 반환 코드가 제거된다.
