# T29. 판매자 제출 문서 확인 UX 개선

- 상태:
  완료

- GitHub Issue:
  236

- 우선순위:
  P2

- 선행 조건:
  - 선행 task: T06. Storage orphan 및 개인정보 cleanup 정책 확정, T44. 판매자 신분증 원본 처리 및 KYC 보관 정책 결정, T61. 판매자 신청 서류 문서 타입 정리 (신분증 제거 및 타입명 통일)

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

- 구현 결과

- 하드코딩 제거: `StoreInfoContent.tsx`의 `INITIAL_CERTIFICATIONS`, `CERT_KEY_MAP` 완전 제거. `CertificationSection.tsx`는 props로 받은 실제 문서 데이터를 렌더링하도록 교체.

- 실제 데이터 렌더링 경로: `GET /api/seller-applications/me` → `useMySellerApplication` hook → `CertificationSection` 컴포넌트. 문서 미리보기는 `GET /api/seller-applications/me/documents/[documentId]` → `useDocumentSignedUrl` hook → signed URL로 이미지 렌더링.

- 권한/마스킹 결정: 민감 문서는 서버에서 소유권 검증(신청의 `user_id` 대조) 후 Supabase Storage signed URL(5분 만료)을 발급. 클라이언트는 signed URL만 받으며 storage path를 직접 노출하지 않음. 본인 신청 조회(`getMySellerApplication`)는 RLS 기반 server client 사용, signed URL 생성은 service role 사용.

- 테스트/검증 방법: `API_MOCK_ENABLED=true` 환경에서 `/seller/store` 접속 후 인증 정보 섹션의 3개 서류 목록 및 "보기" 모달 동작 확인. `pnpm test sellerApplicationApi`로 단위 테스트 확인.
