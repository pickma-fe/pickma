# T37. 운영 CS/모니터링/관리자 권한 정책 정리

- 상태:
  진행 전

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
  - 결제 장애, 승인 지연, 특정 가게 운영 중단 공지 기준을 정한다.
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
  - 실서비스 운영 전 체크리스트가 있다.
  - 최소 구조화 로그 형식이 정의된다.
