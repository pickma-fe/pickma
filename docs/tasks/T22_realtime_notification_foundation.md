# T22. 실시간 알림 기반 설계 및 1차 구현

- 상태:
  완료

- GitHub Issue:
  267

- 우선순위:
  P2

- 선행 조건:
  - 선행 task: T11. 결제 outbox/webhook/idempotency 설계, T62. payment_events 테이블 migration 및 이벤트 contract 구현

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
  - `payment_events` 테이블 INSERT 구독을 기반으로 채널 구조를 설계한다 (T62 완료 전제).
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

- 구현 결과:
  - `notifications` 테이블 미생성. Supabase Realtime `postgres_changes` 직접 구독 방식 채택.
  - `payment_events` 테이블에 authenticated SELECT GRANT + 판매자 RLS 정책(`seller_own_store_events`) 추가. `orders` 테이블 `REPLICA IDENTITY FULL` 설정.
  - Migration: `supabase/migrations/20260611100000_realtime_notification_rls.sql`
  - Zustand Toast store (`src/stores/useToastStore.ts`), Toast/ToastContainer 컴포넌트 구현.
  - `useSellerNewOrderNotification`: `orders` UPDATE 구독 (`store_id=eq.{storeId}` 필터). `new.status === 'reserved'` 전이 감지 시 판매자 Toast + TanStack Query invalidate. `confirm_payment` RPC가 결제 확인 시 `status`를 `reserved`로 전환하므로 의미상 결제 완료 이벤트와 동일.
    - 원래 설계(`payment_events` INSERT 구독)는 Supabase Realtime의 서브쿼리 기반 RLS(`auth.uid()` null 평가 문제)로 이벤트가 전달되지 않아 `orders` 구독으로 전환. 상세: `temp/learnings/T22-supabase-realtime-rls.md`
  - `useOrderStatusNotification`: `orders` UPDATE 구독 (`user_id=eq.{userId}` 필터), `reserved→accepted/accepted→ready/ready→completed` 전이 시 소비자 Toast. `/mypage/orders` 경로에서는 Toast 억제(구독 유지).
  - `NotificationBridge` 루트 레이아웃 마운트. 판매자 전용 bridge는 child component 분리로 비판매자의 불필요 API 요청 방지.
  - Set 기반 이벤트 deduplication으로 Realtime 재전송 중복 방지.
  - 채널 1인당 1개 전략으로 Free plan 200 connection 한도 내 운영.
  - 설계 문서: `docs/system_architecture.md` 18절.
