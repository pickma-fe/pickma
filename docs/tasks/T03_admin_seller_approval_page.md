# T03. 관리자 판매자 승인 화면 구현

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P0

- 선행 조건:
  - 선행 task: T07. service role 사용 기준 및 owner scope 테스트 수립
  - 기타 조건: 결제 보상 정책과는 독립적으로 진행 가능

- 분류:
  UI

- 사용자 흐름:
  Admin / Seller

- 주 담당 역할:
  Admin-FE

- 보조 역할:
  Domain, Shared-FE

- 배경:
  판매자 승인 API와 hook은 구현되어 있으나 `/admin/sellers/pending` 페이지는 placeholder다.

- 문제:
  관리자가 UI로 판매자 신청을 승인/거절할 수 없어 판매자 온보딩이 DB 직접 조작에 의존한다.

- 작업 내용:
  - pending seller application 목록을 렌더링한다.
  - 신청 상세, 제출 문서 signed read URL 확인, 승인/거절 액션을 연결한다.
  - 거절 사유 입력 UI와 validation을 구현한다.
  - 성공 후 목록 invalidate와 toast/error 상태를 처리한다.
  - admin page-local 컴포넌트는 `src/app/(admin)/admin/_components`를 우선 사용하고, cross-domain 재사용성이 확인된 presentational component만 공통 컴포넌트로 승격한다.

- 관련 파일/영역:
  - `src/app/(admin)/admin/sellers/pending/page.tsx`
  - `src/hooks/admin/sellers/*`
  - `src/hooks/admin/seller-application-documents/*`
  - `src/api/admin/sellers/*`
  - `src/app/(admin)/admin/_components/*`

- 예상 난이도:
  중간

- 완료 기준:
  - 관리자가 pending 신청을 조회할 수 있다.
  - 문서 확인 후 승인/거절할 수 있다.
  - 승인/거절 결과가 판매자 온보딩 상태에 반영된다.
  - 기본 loading/error/empty 상태가 있다.
