# T01. 결제 confirm 보상 정책 확정

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P0

- 선행 조건:
  - 선행 task: 없음

- 분류:
  정책

- 사용자 흐름:
  Customer / Seller / Admin

- 주 담당 역할:
  Domain

- 보조 역할:
  Architecture, Admin-FE, Docs

- 배경:
  Toss confirm 성공 후 내부 `confirm_payment` RPC가 실패하면 실제 결제는 성공했지만 주문은 `processing`에 머무를 수 있다.

- 문제:
  금전 거래와 주문 상태가 분리되는 장애가 발생해도 자동 복구나 운영자 보정 도구가 없다.

- 정책 선택지:
  - 옵션 A: `processing` 유지 + 관리자 수동 보정
  - 옵션 B: 내부 확정 실패 시 Toss 자동 취소 + 주문 상태 복구
  - 옵션 C: payment attempt/outbox + 재시도 worker + webhook
  - 권장: 심화 전 P0로 A 또는 B를 선택하고, C는 T11로 분리한다.

- 작업 내용:
  - 옵션 A/B/C 중 심화 전 단기 정책을 선택한다.
  - `processing` 주문의 운영 처리 기준을 정한다.
  - 선택 정책에 따라 필요한 최소 관리자 조회/보정 기능 범위를 확정한다.
  - 정책을 `docs/api_spec.md`, `docs/system_architecture.md`, 운영 backlog에 반영한다.

- 관련 파일/영역:
  - `src/app/api/payments/_lib/service.ts`
  - `docs/api_spec.md`
  - `docs/system_architecture.md`

- 예상 난이도:
  높음

- 완료 기준:
  - 팀이 승인한 보상 정책이 문서화된다.
  - `processing` 장애 주문의 감지/처리 절차가 명확하다.
  - 후속 구현 task가 API/UI 단위로 분리된다.
