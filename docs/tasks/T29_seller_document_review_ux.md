# T29. 판매자 제출 문서 확인 UX 개선

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P2

- 선행 조건:
  - 선행 task: T06. Storage orphan 및 개인정보 cleanup 정책 확정

- 분류:
  UI

- 사용자 흐름:
  Seller

- 주 담당 역할:
  Seller-FE

- 보조 역할:
  Domain

- 배경:
  판매자 가게 정보 페이지의 인증서 목록이 `INITIAL_CERTIFICATIONS` 하드코딩으로 렌더링된다.

- 문제:
  판매자가 실제 제출한 문서 목록과 상태를 확인할 수 없다.

- 작업 내용:
  - 판매자 본인의 제출 문서 조회 API 필요 여부를 결정한다.
  - 하드코딩 목록을 실제 신청/문서 상태 기반으로 교체한다.
  - 민감 문서 다운로드/미리보기 권한과 masking 정책을 정한다.

- 관련 파일/영역:
  - `src/app/(seller)/seller/store/_components/StoreInfoContent.tsx`
  - `src/app/(seller)/seller/store/_components/CertificationSection.tsx`
  - `src/app/(seller)/seller/store/_components/CertificationDetailModal.tsx`
  - `src/app/api/seller-applications/*`

- 예상 난이도:
  중간

- 완료 기준:
  - 하드코딩 인증 목록이 제거된다.
  - 판매자가 실제 제출 문서 상태를 확인할 수 있다.
