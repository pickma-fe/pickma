# T03. 관리자 판매자 승인 화면 구현

- 상태:
  완료

- GitHub Issue:
  216

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
  판매자 승인 API와 hook을 기반으로 `/admin/sellers/pending` 페이지에서 pending seller application을 검토할 수 있어야 한다.

- 문제:
  관리자가 UI로 판매자 신청을 승인/거절할 수 없어 판매자 온보딩이 DB 직접 조작에 의존한다.

- 작업 내용:
  - pending seller application 목록을 렌더링한다.
  - 신청 상세, 제출 문서 signed read URL 확인, 승인/거절 액션을 연결한다.
  - 거절 사유 입력 UI와 validation을 구현한다.
  - 성공 후 목록 invalidate와 성공/error 상태를 처리한다.
  - T03 전용 컴포넌트는 `src/app/(admin)/admin/sellers/pending/_components`에 페이지 로컬로 둔다.
  - 여러 admin 화면에서 재사용성이 검증된 presentational component만 별도 공통 컴포넌트로 승격한다.

- 관련 파일/영역:
  - `src/app/(admin)/admin/sellers/pending/page.tsx`
  - `src/app/(admin)/admin/sellers/pending/_components/*`
  - `src/hooks/admin/sellers/*`
  - `src/hooks/admin/seller-application-documents/*`
  - `src/api/admin/sellers/*`

- 예상 난이도:
  중간

- 완료 기준:
  - 관리자가 pending 신청을 조회할 수 있다.
  - 문서 확인 후 승인/거절할 수 있다.
  - 승인/거절 결과가 판매자 온보딩 상태에 반영된다.
  - 기본 loading/error/empty 상태가 있다.

- 구현 결과:
  - `/admin/sellers/pending` placeholder를 실제 판매자 승인 화면으로 교체했다.
  - pending seller application 목록을 `useAdminPendingSellerApplications`와 연결했다.
  - 상호명/대표자명/이메일/전화번호 검색, 신청일, 업종 필터 UI를 서버 검색/필터 query와 연결했다.
  - 신청 상세 모달에서 신청 정보와 제출 문서를 확인할 수 있게 했다.
  - 제출 문서 열람은 `useSellerApplicationDocumentReadUrl` signed URL 요청으로 연결했다.
  - 승인 액션은 `useApproveSellerApplication`, 거절 액션은 사유 입력 모달과 `useRejectSellerApplication`으로 연결했다.
  - 승인/거절 성공 메시지, 액션 실패 메시지, 목록 loading/error/empty 상태를 추가했다.
