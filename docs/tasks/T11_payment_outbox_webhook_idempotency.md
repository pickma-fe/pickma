# T11. 결제 outbox/webhook/idempotency 설계

- 상태:
  완료

- GitHub Issue:
  209

- 우선순위:
  P1

- 선행 조건:
  - 선행 task: T01. 결제 confirm 보상 정책 확정

- 분류:
  아키텍처

- 사용자 흐름:
  Customer / Seller / Admin

- 주 담당 역할:
  Architecture

- 보조 역할:
  Domain, Docs

- 배경:
  P0에서는 단기 결제 보상 정책을 결정하더라도, 실시간 알림/정산/환불 확장에는 이벤트 기록과 재시도 기반이 필요하다.

- 문제:
  webhook과 idempotency 설계 없이 실시간 알림을 붙이면 잘못된 중간 상태가 사용자에게 전파될 수 있다.

- 작업 내용:
  - payment attempt 또는 outbox 테이블 설계를 작성한다.
  - Toss webhook 수신 정책과 허용 결제수단 범위를 정한다.
  - confirm retry와 idempotency key 기준을 정한다.
  - P2 realtime notification과 연결할 이벤트 모델을 정의한다.
  - T01 보상 실패 이벤트(callTossCancel 실패, revert_payment_processing 실패, processing 30분 잔류)를 같은 운영 이벤트 모델로 통합해 추적 가능하도록 설계한다.

- 관련 파일/영역:
  - `src/app/api/payments/_lib/service.ts`
  - `src/contracts/payment.ts`
  - `docs/system_architecture.md`
  - `docs/api_spec.md`

- 예상 난이도:
  높음

- 완료 기준:
  - 결제 이벤트/재시도/웹훅 설계 문서가 있다.
  - 추후 구현할 schema/API task가 분리되어 있다.

- 구현 결과:
  - 설계 문서: `docs/payment_event_design.md` (이벤트 모델, webhook 정책, idempotency 기준, T22 Realtime 구독 모델)
  - `docs/api_spec.md` 6.5절: webhook 이벤트별 검증 방식, idempotency, 허용 이벤트/결제수단 구체화
  - `docs/system_architecture.md` 7절: 이벤트 모델 참조 및 후속 task 명시
  - 후속 구현 task: T62(`payment_events` migration + contract), T63(webhook Route Handler)
  - T22/T31 선행 조건에 T62 추가
