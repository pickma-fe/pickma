# T62. payment_events 테이블 migration 및 이벤트 contract 구현

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P1

- 선행 조건:
  - 선행 task: T11. 결제 outbox/webhook/idempotency 설계

- 분류:
  구현

- 사용자 흐름:
  Customer / Seller / Admin

- 주 담당 역할:
  Architecture, Domain

- 보조 역할:
  Docs

- 배경:
  T11에서 결제 이벤트 모델 설계가 완료됐다. `payment_events` 테이블을 생성하고, 이벤트 타입을 공통 contract로 정의하며, 결제 확정 시 `payment_confirmed` 이벤트가 atomic하게 기록되도록 구현한다.

- 작업 내용:
  - `payment_events` 테이블 incremental migration 파일 작성 (`docs/payment_event_design.md` 2절 스키마 기준)
  - `payment_events` 공통 event contract 정의 (`src/contracts/payment.ts` 또는 별도 `src/contracts/payment-event.ts`)
  - `confirm_payment` DB RPC 내부에서 `payment_confirmed` 이벤트 INSERT (atomic)
  - 중복 confirm 응답을 `PAYMENT_ALREADY_CONFIRMED`로 매핑할지 여부 결정 및 구현

- 관련 파일/영역:
  - `supabase/migrations/` (신규 migration)
  - `src/contracts/payment.ts` 또는 `src/contracts/payment-event.ts`
  - `supabase/functions/` 또는 DB RPC (`confirm_payment`)
  - `docs/payment_event_design.md`

- 예상 난이도:
  중간

- 완료 기준:
  - `payment_events` 테이블이 migration으로 생성된다.
  - 이벤트 타입이 공통 contract에 정의된다.
  - 결제 확정 시 `payment_confirmed` 이벤트가 atomic하게 삽입된다.
  - T22(Realtime 구독), T31(취소 이벤트), T43(Cron 감지)가 이 테이블을 사용할 수 있다.
