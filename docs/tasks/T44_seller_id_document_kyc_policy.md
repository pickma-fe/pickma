# T44. 판매자 신분증 원본 처리 및 KYC 보관 정책 결정

- 상태:
  완료

- GitHub Issue:
  191

- 우선순위:
  P0

- 선행 조건:
  - 선행 task: T06. Storage orphan 및 개인정보 cleanup 정책 확정

- 분류:
  법적 준수

- 사용자 흐름:
  Seller

- 주 담당 역할:
  Domain

- 보조 역할:
  Architecture, Legal

- 배경:
  판매자 신청 시 대표자 신분증 원본 이미지가 `seller-application-documents` bucket에 저장된다. 신분증에 주민등록번호 등 고유식별정보가 포함될 수 있으므로 개인정보보호법 제24조 관점에서 원본 보관 필요성과 대체 방식을 재검토해야 한다.

- 문제:
  신분증 원본 이미지가 그대로 저장되면 유출 시 고유식별정보 침해 리스크가 크다. Toss 지급대행/KYC 책임 범위에 따라 PickMa가 신분증 원본을 직접 보관할 필요가 없을 수도 있으나, 현재 정책과 구현 방향이 확정되어 있지 않다.

- 작업 내용:
  - Toss 지급대행/KYC 계약 범위를 확인해 PickMa의 신분증 보관 의무를 결정한다.
  - 업로드 전 클라이언트 마스킹, 서버 수신 후 마스킹, PASS/휴대폰 인증 및 계좌 인증 등 대체 인증 방식 중 1차 방향을 선택한다.
  - 선택한 방향에 따라 `seller-application-documents` bucket에 저장 가능한 문서 범위와 보관 기간을 재정의한다.
  - 판매자 신청 서류 업로드 UX에서 주민번호 뒷자리 마스킹 안내와 제출 차단 필요 여부를 결정한다.
  - T42의 판매자 신청 동의 문구와 필수 동의 범위에 반영할 정책 기준을 제공한다.
  - `docs/legal_compliance.md`와 `docs/system_architecture.md`의 미결 항목을 업데이트한다.

- 관련 파일/영역:
  - `docs/legal_compliance.md`
  - `docs/system_architecture.md`
  - `src/app/(seller)/seller/register/_components/DocumentStep.tsx`
  - `src/app/api/seller-applications/_lib/service.ts`
  - Supabase Storage `seller-application-documents`

- 예상 난이도:
  중간

- 완료 기준:
  - PickMa가 신분증 원본을 보관해야 하는지 정책적으로 결정된다.
  - 주민등록번호 등 고유식별정보 처리 방식이 문서화된다.
  - 선택한 방식에 필요한 후속 구현 task가 API/UI/외부 인증 연동 단위로 분리된다.
  - `docs/legal_compliance.md`의 신분증 원본 처리 개선 미결 항목이 갱신된다.

- 구현 결과:
  - Toss 지급대행이 KYC를 직접 수행하므로 PickMa 신분증 수집 불필요 — 정책 결정 완료.
  - 판매자 신청 서류를 사업자등록증·영업신고증·통장사본 3종으로 한정, 신분증(`id_card`) 수집 폐지.
  - `docs/legal_compliance.md` 섹션 1(PIPA 제23·24조), 2(동의 체크리스트), 3(처리방침 항목), 4(미결 항목) 갱신.
  - `docs/system_architecture.md` 섹션 14.1(bucket 저장 문서 3종 명시), 14.5(재검토 항목) 갱신.
  - T42 판매자 신청 동의 흐름 기준 갱신 (PIPA 제23·24조 별도 동의 불필요).
  - T29/T36 선행 조건에 T61 추가.
  - 코드/DB 기준 제거 후속 task T61 정의.
