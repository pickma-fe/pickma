# T61. 판매자 신청 서류에서 신분증 타입 완전 제거

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P1

- 선행 조건:
  - 선행 task: T44. 판매자 신분증 원본 처리 및 KYC 보관 정책 결정

- 분류:
  법적 준수

- 사용자 흐름:
  Seller

- 주 담당 역할:
  Domain

- 보조 역할:
  Architecture

- 배경:
  T44에서 판매자 신청 서류에서 신분증(`id_card`)을 제거하는 정책이 결정되었다. 현재 코드와 DB 스키마는 여전히 `id_card`를 필수 문서 타입으로 포함하고 있어 정책과 구현이 불일치한다. T42(판매자 신청 동의 흐름) 및 T29/T36(제출 문서 UX/정책)이 3종 서류 기준으로 진행하려면 코드/DB 기준이 먼저 정리되어야 한다.

- 문제:
  `DocumentStep.tsx`에 `idCard`가 REQUIRED로 설정되어 있고, `service.ts`의 `REQUIRED_DOCUMENT_TYPES`에 `id_card`가 포함된다. DB `seller_application_document_type` enum에도 `id_card` 값이 존재한다.

- 작업 내용:
  **코드 기준 제거**
  - `src/app/(seller)/seller/register/_components/DocumentStep.tsx`: `idCard` 항목 제거
  - `src/app/api/seller-applications/_lib/service.ts`: `REQUIRED_DOCUMENT_TYPES`에서 `id_card` 제거
  - `src/app/api/files/upload-url/_lib/schemas.ts`: `id_card` upload URL 발급 차단
  - `src/types/seller-application.ts`, `src/contracts/seller-application.ts`: 판매자 신청 문서 타입을 3종 기준으로 갱신
  - `src/hooks/seller/applications/useCreateSellerApplication.ts` 및 관련 test: `idCard` 업로드/제출 제거
  - `src/app/api/seller-applications/_lib/schemas.ts` 및 관련 service/route test: 3종 문서 검증으로 갱신
  - `src/mocks/seller.ts`: mock 문서 목록 3종 기준으로 갱신

  **문서 기준 갱신**
  - `docs/domain.md`: 판매자 신청 문서 타입 3종 기준으로 갱신
  - `docs/api_spec.md`: 판매자 신청 문서 타입 3종 기준으로 갱신
  - `docs/erd.md`: 판매자 신청 문서 타입 3종 기준으로 갱신

  **DB 기준 제거 (DB reset 합의 전제)**
  - `supabase/migrations/20260430000000_initial_schema.sql`: `seller_application_document_type` enum에서 `id_card` 값 제거
    - 초기 migration 수정은 팀 합의 및 DB reset이 명확히 결정된 경우에 한해 진행
  - `src/lib/supabase/database.ts`: Supabase typegen 결과 갱신 (typegen 재실행 또는 수동 수정)
  - 기존 `id_card` row/object가 있다면 DB reset 또는 cleanup 절차로 제거

- 관련 파일/영역:
  - `src/app/(seller)/seller/register/_components/DocumentStep.tsx`
  - `src/app/api/seller-applications/_lib/service.ts`
  - `src/app/api/seller-applications/_lib/schemas.ts`
  - `src/app/api/files/upload-url/_lib/schemas.ts`
  - `src/types/seller-application.ts`
  - `src/contracts/seller-application.ts`
  - `src/hooks/seller/applications/useCreateSellerApplication.ts`
  - `src/mocks/seller.ts`
  - `src/lib/supabase/database.ts`
  - `supabase/migrations/20260430000000_initial_schema.sql`
  - `docs/domain.md`, `docs/api_spec.md`, `docs/erd.md`

- 예상 난이도:
  중간

- 완료 기준:
  - `DocumentStep.tsx`에서 `idCard` 항목이 제거된다.
  - `REQUIRED_DOCUMENT_TYPES`에 `id_card`가 포함되지 않는다.
  - upload-url에서 `id_card` documentType이 거부된다.
  - types/contracts/schema/hook/mocks가 3종 문서 기준과 일치한다.
  - DB `seller_application_document_type` enum에서 `id_card`가 제거된다 (DB reset 합의 후).
  - typegen 결과가 3종 문서 타입만 반영한다.
  - domain.md/api_spec.md/erd.md가 3종 서류 기준으로 갱신된다.
