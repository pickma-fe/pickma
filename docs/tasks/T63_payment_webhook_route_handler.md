# T63. POST /api/payments/webhook Route Handler 구현

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P1

- 선행 조건:
  - 선행 task: T62. payment_events 테이블 migration 및 이벤트 contract 구현

- 분류:
  구현

- 사용자 흐름:
  Customer / Seller / Admin

- 주 담당 역할:
  Architecture

- 보조 역할:
  Domain

- 배경:
  T62에서 `payment_events` 테이블과 공통 event contract가 준비된다. T63에서는 Toss가 호출하는 webhook endpoint를 구현한다.

- 작업 내용:
  - `POST /api/payments/webhook` Route Handler 구현
  - 이벤트별 검증 방식 구현:
    - `PAYMENT_STATUS_CHANGED`: `body.data.orderId`(=orderNumber), `body.data.totalAmount`를 DB와 교차 검증 + HTTPS (body 구조: `{ eventType, createdAt, data: Payment객체 }`)
    - `DEPOSIT_CALLBACK`: `body.secret`을 `payments.pg_response.secret`과 비교, `body.orderId`(=orderNumber)로 결제 조회 (body 구조: `{ createdAt, secret, status, orderId, transactionKey }`)
  - Idempotency 처리: `tosspayments-webhook-transmission-id` → `provider_event_id`, `(provider, provider_event_id)` unique index로 중복 차단
  - `payment_webhook_received` 이벤트 INSERT 및 처리 상태 갱신
  - 허용 이벤트 타입: `PAYMENT_STATUS_CHANGED`, `DEPOSIT_CALLBACK`
  - 허용 결제수단: `card`, `virtual_account`, `mobile`, `easy_pay`

- 관련 파일/영역:
  - `src/app/api/payments/webhook/route.ts` (신규)
  - `src/app/api/payments/_lib/service.ts` 또는 `src/app/api/payments/webhook/_lib/`
  - `src/contracts/payment-event.ts`
  - `docs/payment_event_design.md` 5절

- 예상 난이도:
  중간

- 완료 기준:
  - Toss webhook 수신 시 이벤트별 검증을 통과한다.
  - 중복 수신 시 `200 OK`를 반환한다 (멱등 처리).
  - `payment_webhook_received` 이벤트가 `payment_events`에 기록된다.
  - 처리 완료 시 `status='processed'`, `processed_at`이 갱신된다.
