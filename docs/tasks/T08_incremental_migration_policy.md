# T08. incremental migration 전환 결정

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P0

- 선행 조건:
  - 선행 task: 없음

- 분류:
  아키텍처

- 사용자 흐름:
  Shared

- 주 담당 역할:
  Architecture

- 보조 역할:
  Domain, Docs

- 배경:
  현재 프로젝트는 단일 초기 migration 파일을 직접 수정하고 `db reset`으로 반영하는 방식에 가깝다.

- 문제:
  심화 프로젝트의 위치 컬럼, 알림 테이블, 운영 상태 컬럼을 프로덕션 DB에 안전하게 반영할 경로가 없다.

- 작업 내용:
  - 앞으로의 schema 변경은 incremental migration으로 작성한다는 원칙을 결정한다.
  - 기존 초기 migration 수정 허용 범위를 문서화한다.
  - 심화 기능별 예정 migration 목록을 만든다.

- 관련 파일/영역:
  - `supabase/migrations/*`
  - `docs/system_architecture.md`
  - `docs/erd.md`

- 예상 난이도:
  중간

- 완료 기준:
  - migration 운영 원칙이 문서화된다.
  - 신규 스키마 작업자가 초기 migration 직접 수정 여부로 혼란을 겪지 않는다.
  - P1/P2 스키마 작업의 선행 조건이 충족된다.
