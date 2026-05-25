# T48. Admin UI/UX 및 접근성 개선

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P2

- 선행 조건:
  - 선행 task: T45. UI/UX 및 접근성 baseline 기준 수립, T03. 관리자 판매자 승인 화면 구현, T04. 관리자 가게 목록 real endpoint 및 화면 구현, T26. 운영 화면 summary/list API 분리

- 분류:
  UI

- 사용자 흐름:
  Admin

- 주 담당 역할:
  Admin-FE

- 보조 역할:
  Shared-FE, QA

- 배경:
  Admin 흐름은 판매자 승인, 가게 목록, 운영 현황 확인처럼 플랫폼 운영 판단을 돕는 화면이다. 운영 화면은 빠른 스캔, 명확한 상태, 안전한 action, 접근 가능한 dialog/form이 중요하다.

- 문제:
  관리자 화면에서 심사 action, 상태 badge, table/list, confirm/reject 흐름의 접근성 기준이 흐리면 잘못된 운영 판단이나 작업 실수가 발생할 수 있다.

- 작업 내용:
  - 관리자 홈, 판매자 승인, 가게 목록 화면을 T45 체크리스트로 점검한다.
  - pending/approved/rejected 등 심사 상태 표시와 action CTA의 의미를 명확히 한다.
  - approve/reject dialog, reason 입력, confirm action의 keyboard/focus 처리를 점검한다.
  - table/list의 빈 상태, loading/error 상태, 모바일 표시를 점검한다.
  - T03, T04, T26 구현 범위와 겹치는 개선은 해당 task와 조정한다.

- 관련 파일/영역:
  - `src/app/(admin)/admin/page.tsx`
  - `src/app/(admin)/admin/sellers/pending/page.tsx`
  - `src/app/(admin)/admin/stores/page.tsx`
  - `src/components/admin/**`
  - `src/hooks/admin/**`

- 예상 난이도:
  중간

- 완료 기준:
  - Admin 주요 화면이 T45 checklist 기준으로 점검되고 개선된다.
  - 심사 action과 운영 상태 표시가 명확하고 keyboard/focus 기준을 만족한다.
  - 관리자 table/list의 loading/error/empty 상태가 일관된다.
  - 필요한 후속 개선이 별도 task 또는 확인 필요 항목으로 분리된다.
