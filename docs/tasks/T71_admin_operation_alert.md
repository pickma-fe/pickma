# T71. 관리자 운영 알람 구현

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P3

- 선행 조건:
  - 선행 task: T22. 실시간 알림 기반 설계 및 1차 구현, T63. POST /api/payments/webhook Route Handler 구현

- 분류:
  기능

- 사용자 흐름:
  Admin

- 주 담당 역할:
  Shared-FE

- 보조 역할:
  Architecture

- 배경:
  T63에서 Toss 웹훅 Route Handler가 구현되어 결제 이벤트(`payment_events`)가 DB에 기록된다. 결제 보정 실패나 오류 이벤트 발생 시 관리자가 즉시 인지할 수 있는 운영 알람이 없다.

- 문제:
  `payment_compensation_failed`, `payment_stuck_processing` 등 운영 위험 이벤트가 발생해도 관리자가 직접 확인하기 전까지 알 수 없다.

- 작업 내용:
  - 관리자 알람 대상 이벤트를 확정한다 (예: `payment_compensation_failed`, `payment_stuck_processing`, 기타 `event_type`).
  - 알람 전달 방식을 결정한다 (실시간 Toast, 관리자 대시보드 배지, 외부 채널 등).
  - T22 알림 인프라를 활용하거나 관리자 전용 알람 채널을 별도 구성한다.
  - 관리자 세션에서만 알람을 구독하도록 `NotificationBridge`에 관리자 분기를 추가한다.
  - 관리자 대시보드에 미처리 운영 알람 수를 표시한다.

- 관련 파일/영역:
  - `src/components/common/Toast/NotificationBridge.tsx`
  - `src/hooks/notifications/`
  - `src/app/(admin)/` 관련 컴포넌트
  - `payment_events` 테이블 및 RLS

- 예상 난이도:
  중간

- 완료 기준:
  - 관리자 로그인 상태에서 운영 위험 이벤트 발생 시 알람이 전달된다.
  - 알람 대상 이벤트 목록이 문서화된다.
  - 비관리자에게는 운영 알람이 노출되지 않는다.
