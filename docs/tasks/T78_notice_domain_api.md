# T78. 공지사항 도메인 및 API 구현

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P3

- 선행 조건:
  - 선행 task: T58. 관리자 대시보드 통계 API 및 UI 구현

- 분류:
  기능

- 사용자 흐름:
  Admin / Consumer / Seller

- 주 담당 역할:
  Shared-FE

- 보조 역할:
  Architecture, Domain

- 배경:
  T58 구현 시 공지사항 도메인/API가 없어 관리자 대시보드의 공지 연동이 제외됐다. 공지사항 작성/조회 기능이 없어 운영 중 사용자에게 서비스 안내를 전달할 수단이 없는 상태다.

- 문제:
  공지사항 도메인 타입, DB 테이블, API가 없어 관리자가 공지를 작성하거나 사용자가 공지를 확인하는 흐름이 존재하지 않는다.

- 작업 내용:
  - 공지사항 도메인 타입을 `src/types/`에 정의한다.
  - DB 테이블 및 마이그레이션을 작성한다.
  - 관리자 공지 작성/수정/삭제 API를 구현한다.
  - 공지 목록/상세 조회 API를 구현한다 (Consumer/Seller 공개 여부 포함).
  - 관리자 대시보드 및 사용자 화면에 공지 연동 UI를 추가한다.

- 관련 파일/영역:
  - `src/types/notice.ts` (신규)
  - `src/contracts/notice.ts` (신규)
  - `src/app/api/admin/notices/` (신규)
  - `src/app/api/notices/` (신규)
  - `supabase/migrations/` (신규 notices 테이블)

- 예상 난이도:
  중간

- 완료 기준:
  - 관리자가 공지사항을 작성/수정/삭제할 수 있다.
  - Consumer/Seller가 공지 목록을 조회할 수 있다.
  - 관리자 대시보드에서 공지 연동이 완성된다.
