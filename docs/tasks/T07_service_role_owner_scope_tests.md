# T07. service role 사용 기준 및 owner scope 테스트 수립

- 상태:
  진행 중

- GitHub Issue:
  175

- 우선순위:
  P0

- 선행 조건:
  - 선행 task: 없음

- 분류:
  보안

- 사용자 흐름:
  Shared

- 주 담당 역할:
  Architecture

- 보조 역할:
  Domain, Docs

- 배경:
  다수 Route Handler service가 `createServiceRoleClient()`를 사용해 RLS를 우회한다.

- 문제:
  endpoint 검증 하나가 빠지면 사용자/판매자/관리자 데이터 노출 또는 변조로 이어질 수 있다.

- 작업 내용:
  - service role 허용 기준을 정리한다.
  - 사용자/판매자 단순 조회 중 RLS+server client 전환 후보를 분류한다.
  - owner/store/admin scope 테스트가 필요한 API 목록을 작성한다.
  - 신규 Route Handler checklist에 권한 검증 항목을 추가한다.

- 관련 파일/영역:
  - `src/app/api/**/*`
  - `src/app/api/_lib/auth.ts`
  - `src/lib/supabase/*`
  - `docs/system_architecture.md`

- 예상 난이도:
  높음

- 완료 기준:
  - service role 사용 기준 문서가 있다.
  - P0/P1 API의 owner scope 테스트 목록이 확정된다.
  - 신규 API 구현 시 참고할 checklist가 생긴다.
