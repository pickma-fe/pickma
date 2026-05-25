# T32. 정산/수수료 시스템 설계

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P3

- 선행 조건:
  - 선행 task: T31. 주문 취소/환불 API 구현

- 분류:
  데이터

- 사용자 흐름:
  Seller / Admin

- 주 담당 역할:
  Domain

- 보조 역할:
  Admin-FE, Docs

- 배경:
  현재 결제 원본 데이터는 보존되지만 정산/수수료 테이블은 없다.

- 문제:
  판매자 정산, 플랫폼 수수료, 환불 차감 정책이 없으면 실제 매출 운영이 어렵다.

- 작업 내용:
  - `settlements`, `platform_fees` 등 후보 schema를 설계한다.
  - 정산 주기, 취소/환불 반영 기준, 관리자 검수 흐름을 정한다.
  - 판매자 정산 조회와 관리자 정산 관리 화면 범위를 분리한다.

- 관련 파일/영역:
  - `docs/erd.md`
  - `src/app/api/payments/*`
  - `src/app/api/admin/*`
  - `src/contracts/payment.ts`

- 예상 난이도:
  높음

- 완료 기준:
  - 정산 도메인 초안과 확장 migration 계획이 있다.
  - 심화 이후 구현 가능한 task로 분리된다.
