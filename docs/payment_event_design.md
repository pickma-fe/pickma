# 결제 이벤트 모델 설계

결제 흐름에서 발생하는 이벤트를 추적하기 위한 `payment_events` 테이블 스키마, 이벤트 타입, webhook 수신 정책, idempotency 기준을 정의한다.

T11 설계 문서. 구현은 T62(migration + event contract), T63(webhook Route Handler)에서 진행한다.

---

## 1. 설계 배경

T01에서 Option B 보상 정책을 채택했다. Toss confirm 성공 후 `confirm_payment` RPC가 실패하면 Toss 자동 취소를 시도하고, 취소 또는 revert가 실패하면 주문은 `processing`에 잔류한다. 이 gap 상태를 포함한 모든 결제 이벤트를 추적 가능한 형태로 기록하기 위해 `payment_events` 이벤트 로그 테이블을 도입한다.

**이벤트 로그 방식 채택 이유:**

- Outbox pattern은 전용 상시 worker가 필요하다. Vercel 환경에서는 상시 worker 운용이 어렵다.
- Event log는 append-only 기록이며, 처리 주체를 Cron(T43), webhook 수신, API 진입 등 다양하게 선택할 수 있다.
- Supabase Realtime으로 `payment_events` 테이블 INSERT를 구독하면 T22 notification 연동이 자연스럽다.

---

## 2. `payment_events` 테이블 스키마

```sql
CREATE TABLE payment_events (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            uuid        NOT NULL REFERENCES orders(id),
  order_number        text        NOT NULL,
  payment_id          uuid        REFERENCES payments(id),  -- 결제 완료 전에는 NULL
  event_type          text        NOT NULL,
  provider            text,                                 -- 'toss' 등 결제 provider
  provider_key        text,                                 -- provider_payment_key 등 결제 식별자
  provider_event_type text,                                 -- Toss webhook eventType 등
  provider_event_id   text,                                 -- tosspayments-webhook-transmission-id 등
  payload             jsonb,
  status              text        NOT NULL DEFAULT 'pending', -- 'pending' | 'processed' | 'failed'
  error_message       text,
  processed_at        timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- webhook 중복 수신 방지
CREATE UNIQUE INDEX payment_events_provider_event_uniq
  ON payment_events (provider, provider_event_id)
  WHERE provider_event_id IS NOT NULL;
```

`payment_id`는 `payment_confirmed` 이후 채워진다. `payment_compensation_failed`는 `confirm_payment` RPC 실패 후에 발생하므로 payment row가 없을 수 있다.

---

## 3. 이벤트 타입

| event_type                    | 발생 시점                                                   | 삽입 위치                            | 소비 주체                  |
| ----------------------------- | ----------------------------------------------------------- | ------------------------------------ | -------------------------- |
| `payment_confirmed`           | `confirm_payment` RPC 성공 직후                             | RPC 내부 (atomic)                    | T22 realtime notification  |
| `payment_compensation_failed` | `callTossCancel` 실패 또는 `revert_payment_processing` 실패 | `service.ts` 보상 블록 (best-effort) | 운영 알람                  |
| `payment_stuck_processing`    | `processing` 30분 이상 잔류 감지                            | Cron job (T43 scope)                 | 운영 알람                  |
| `payment_webhook_received`    | Toss webhook 수신 직후                                      | webhook Route Handler (T63)          | 상태 동기화                |
| `payment_cancelled`           | 결제 취소 완료 직후                                         | 취소 RPC 내부 (T31)                  | T22 notification, T31 정산 |

### `payment_compensation_failed` payload

```jsonc
{
  "failureStage": "toss_cancel" | "revert_processing",
  "paymentStateAssumption": "approved_may_remain" | "cancelled_may_be_done",
  "manualAction": "check_toss_and_cancel_or_refund" | "restore_order_status",
  "orderStatus": "processing",
  "tossPaymentKey": "<string | null>"
}
```

운영 판단 기준:

- `failureStage='toss_cancel'`: Toss 승인 결제가 남아 있을 수 있다. 운영자는 Toss 결제 상태를 확인하고 취소/환불 또는 주문 복구를 결정한다.
- `failureStage='revert_processing'`: Toss cancel은 성공했을 수 있으나 주문이 `processing`에 잔류한다. 운영자는 주문 상태 복구를 우선 확인한다.

---

## 4. Confirm Idempotency

DB에는 `payments(provider, provider_payment_key)` partial unique index가 이미 존재한다. 별도 constraint 추가 없이 다음 두 계층에서 idempotency를 보장한다.

| 계층      | 방식                                                             | 비고                                                                           |
| --------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Toss API  | `Idempotency-Key: confirm:{orderNumber}:{paymentKey}` 헤더       | 동일 key 재요청 시 Toss가 동일 결과 반환                                       |
| PickMa DB | 주문 상태 검증 (`payment_pending`만 허용) + RPC unique violation | 중복 confirm 시도는 `INVALID_ORDER_STATUS` 또는 unique constraint error로 차단 |

후속 구현(T62)에서 중복 confirm 응답을 `PAYMENT_ALREADY_CONFIRMED` 에러로 명확히 매핑할지 결정한다.

---

## 5. Toss Webhook 정책

### 5.1 엔드포인트

`POST /api/payments/webhook` (구현: T63)

### 5.2 허용 이벤트 타입

| Toss eventType           | 처리 내용             |
| ------------------------ | --------------------- |
| `PAYMENT_STATUS_CHANGED` | 결제 상태 변화 동기화 |
| `DEPOSIT_CALLBACK`       | 가상계좌 입금 확인    |

### 5.3 허용 결제수단

`card`, `virtual_account`, `mobile`, `easy_pay`

### 5.4 검증 방식

Toss webhook은 이벤트별로 다른 검증 방식을 사용한다.

| eventType                | 검증 방법                                                                                       |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| `PAYMENT_STATUS_CHANGED` | HMAC 서명 없음. payload의 `orderNumber`, `amount`를 DB `orders`, `payments`와 교차 검증 + HTTPS |
| `DEPOSIT_CALLBACK`       | payload의 `secret` 필드를 `payments.pg_response.secret`에 저장된 값과 비교                      |

`TOSS_WEBHOOK_SECRET` 환경변수는 사용하지 않는다. Toss는 `PAYMENT_STATUS_CHANGED`에 HMAC 서명을 제공하지 않는다.

### 5.5 `DEPOSIT_CALLBACK` 검증을 위한 secret 저장

`DEPOSIT_CALLBACK` 검증에는 Toss confirm 응답의 `secret`이 필요하다. `confirm_payment` 흐름에서 Toss 응답의 최소 필드만 `payments.pg_response` jsonb에 저장한다.

저장 필드:

```jsonc
{
  "paymentKey": "<string>",
  "orderId": "<string>",
  "method": "<string>",
  "status": "<string>",
  "secret": "<string | null>", // 가상계좌 발급 시에만 존재
}
```

카드번호, 계좌번호, 고객 식별성이 높은 상세 정보는 저장하지 않는다.

### 5.6 Webhook Idempotency

`tosspayments-webhook-transmission-id` 헤더를 `provider_event_id`로 저장하고, `(provider, provider_event_id)` unique index로 retry/중복 수신을 처리한다.

처리 흐름 (T63 구현 기준):

1. `provider_event_id` 중복 여부 확인 → 이미 존재하면 `200 OK` 반환 (멱등 처리)
2. `payment_webhook_received` 이벤트 INSERT (`status='pending'`)
3. 이벤트 타입별 처리 수행
4. 처리 완료 후 `status='processed'`, `processed_at=now()` 갱신

---

## 6. T22 Realtime 구독 모델

Supabase Realtime으로 `payment_events` 테이블 INSERT를 구독한다.

| 소비자 유형 | 구독 채널 이벤트                                          | 사용 목적      |
| ----------- | --------------------------------------------------------- | -------------- |
| 소비자      | `payment_confirmed`                                       | 결제 성공 알림 |
| 판매자      | `payment_confirmed`                                       | 신규 주문 알림 |
| 관리자      | `payment_compensation_failed`, `payment_stuck_processing` | 운영 알람      |

채널 필터는 `order_id` 또는 `store_id`(payload에 포함) 기준으로 격리한다. 구현 상세는 T22에서 결정한다.

---

## 7. 후속 구현 Task

| Task | 내용                                                                                                                               | 선행 |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------- | ---- |
| T62  | `payment_events` 테이블 incremental migration + 공통 event contract + `confirm_payment` RPC 내부 `payment_confirmed` 이벤트 INSERT | T11  |
| T63  | `POST /api/payments/webhook` Route Handler 구현 (검증, idempotency, event log 저장)                                                | T62  |
| T43  | `processing` 잔류 주문 Cron 감지 및 `payment_stuck_processing` 이벤트 삽입                                                         | T62  |
| T22  | Supabase Realtime `payment_events` INSERT 구독 기반 알림 구현                                                                      | T62  |
| T31  | 주문 취소/환불 API 구현 (`payment_cancelled` 이벤트 atomic 기록 포함)                                                              | T62  |

---

## 8. 관련 문서

- 결제 흐름 및 Option B 보상 정책: `docs/system_architecture.md` 7절
- webhook endpoint 명세: `docs/api_spec.md` 6.5절
- migration 정책: `docs/migration_policy.md`
- 결제 서비스 구현: `src/app/api/payments/_lib/service.ts`
- Toss adapter: `src/app/api/payments/_lib/toss.ts`
