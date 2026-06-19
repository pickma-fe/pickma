# T37. 운영 CS/모니터링/관리자 권한 정책 정리

- 상태:
  완료

- GitHub Issue:
  확인 필요

- 우선순위:
  P3

- 선행 조건:
  - 선행 task: T01. 결제 confirm 보상 정책 확정, T06. Storage orphan 및 개인정보 cleanup 정책 확정

- 분류:
  정책

- 사용자 흐름:
  Admin / Shared

- 주 담당 역할:
  Docs

- 보조 역할:
  Architecture, Domain, Admin-FE

- 배경:
  MVP 운영 정책 backlog에는 결제/주문 CS, 관리자 계정, 공지, 신고/제재, 데이터 보존, 장애 모니터링, 정산 정책이 분산되어 있었다.

  Harness 관점 (H8): 로컬 로그/메트릭/트레이스 쿼리 스택이 없다. 결제/주문/Storage 같은 운영 흐름에서 장애 진단이 수동적이다.

- 문제:
  운영 절차가 기능 task와 분리되지 않으면 실서비스 전 어떤 정책이 필수인지 판단하기 어렵다.

- 작업 내용:
  - 주문/결제/픽업 문의의 운영 확인 순서를 정한다.
  - admin 계정 생성/회수/분실 대응 정책을 정한다.
  - 관리자 action audit log 범위를 정한다.
    - 예: 판매자 승인/거절, 주문/결제 CS 처리, 관리자 권한 변경
    - 감사 로그를 DB/API 구현까지 다뤄야 하면 T37 작업 중 후속 task를 생성한다.
  - service role 사용 구간 중 RLS + server client 전환 후보를 정리한다.
    - RLS 전환을 실제 DB/API 구현까지 다뤄야 하면 T37 작업 중 후속 task를 생성한다.
  - 결제 장애, 승인 지연, 특정 가게 운영 중단 공지 기준을 정한다.
  - 사용자 계정 정지/활성화 정책을 확정한다 (`PATCH /api/admin/users/:userId/status` 구현 전제 조건 — 정책 확정 후 별도 구현 task 생성).
  - 신고/제재/분쟁 처리의 최소 운영 범위를 정의한다.
  - 주문/결제/판매자 신청 문서/운영 로그의 보존 기간을 정한다.
  - 결제 실패율, 주문 생성 실패, Storage upload 실패 모니터링 지표를 정한다.
  - 개발 하네스 관점에서 최소 구조화 로그도 함께 정한다:
    - Route Handler request id/log format
    - payment/order/storage failure structured log
    - Playwright trace와 app console/network capture 보존

- 관련 파일/영역:
  - `docs/system_architecture.md`
  - `docs/api_spec.md`
  - `docs/erd.md`
  - `src/app/(admin)/admin/*`
  - `src/app/api/admin/*`

- 예상 난이도:
  높음

- 완료 기준:
  - 운영 전 필수 정책과 확장 정책이 분리된다.
  - 관리자 UI/API로 구현할 항목과 문서 절차로 처리할 항목이 구분된다.
  - 관리자 action audit log와 service role/RLS 전환 후보가 후속 구현 여부까지 분리되어 정리된다.
  - 사용자 계정 정지/활성화 정책이 문서화되고, 후속 구현 task가 생성된다.
  - 실서비스 운영 전 체크리스트가 있다.
  - 최소 구조화 로그 형식이 정의된다.

- 구현 결과:
  - `docs/ops_policy.md`: MVP 운영 정책 8절 (CS 절차, Admin 계정, 장애 공지, 계정 정지, 신고/제재, 데이터 보존, 모니터링 지표, 실서비스 체크리스트)
  - `src/app/api/_lib/logger.ts`: Route Handler 전용 구조화 로거 구현 (Logger 인터페이스, generateReqId, createLogger, test env silence)
  - `src/app/api/_lib/logger.test.ts`: logger 단위 테스트 (10 cases)
  - 결제/주문 취소 핸들러(payments/confirm, payments/cancel, orders/cancel, seller/orders/cancel) 로거 연동 — 7개 error 이벤트
  - Admin 판매자 승인/거절 핸들러 감사 로그 연동 — ADMIN_APPROVE_SELLER_SUCCEEDED, ADMIN_REJECT_SELLER_SUCCEEDED
  - Storage cleanup 로거 연동 — 4개 이벤트 (LIST_FAILED, DB_QUERY_FAILED, REMOVE_FAILED, COMPLETED)
  - Auth signup 보상 실패 직접 로그 — AUTH_SIGNUP_AUTH_USER_ORPHANED (console.error + incidentId)
  - `docs/system_architecture.md` 섹션 19 추가 (구조화 로그), 15.3 T37 범위 외 P4 유보 표기
  - RLS 전환은 T37 범위 외로 15.3에 P4 유보 표기 후 별도 task에서 처리
