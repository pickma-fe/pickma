# T22. 실시간 알림 기반 설계 및 1차 구현

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P2

- 선행 조건:
  - 선행 task: T01. 결제 confirm 보상 정책 확정, T11. 결제 outbox/webhook/idempotency 설계

- 분류:
  기능

- 사용자 흐름:
  Customer / Seller / Admin

- 주 담당 역할:
  Domain

- 보조 역할:
  Shared-FE, Architecture

- 배경:
  심화 프로젝트 대상인 실시간 알림은 결제/주문 상태 전이 이벤트와 연결되어야 한다.

- 문제:
  이벤트/outbox 없이 realtime을 붙이면 잘못된 중간 상태나 재시도 상태가 사용자에게 전파될 수 있다.

- 작업 내용:
  - `notifications` 테이블 또는 Supabase Realtime 채널 구조를 설계한다.
  - 사용자별/판매자별 채널 구독 범위를 정한다.
  - 주문 접수, 준비 완료, 픽업 완료, 결제 실패/보정 필요 이벤트를 정의한다.
  - UI 알림 센터 또는 toast 정책을 구현한다.

- 관련 파일/영역:
  - `src/app/api/payments/*`
  - `src/app/api/seller/orders/*`
  - `src/hooks/**/*`
  - `src/components/**/*`
  - `docs/system_architecture.md`

- 예상 난이도:
  높음

- 완료 기준:
  - 주문/결제 주요 이벤트가 알림으로 전달된다.
  - channel 수와 구독 정책이 quota를 고려해 문서화된다.
  - 알림 중복/재시도 기준이 있다.
