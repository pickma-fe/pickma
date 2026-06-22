# T36. 판매자 신청 서류 수정/재업로드 정책

- 상태:
  완료

- GitHub Issue:
  289

- 우선순위:
  P3

- 선행 조건:
  - 선행 task: T06. Storage orphan 및 개인정보 cleanup 정책 확정, T44. 판매자 신분증 원본 처리 및 KYC 보관 정책 결정, T61. 판매자 신청 서류 문서 타입 정리 (신분증 제거 및 타입명 통일)

- 분류:
  정책

- 사용자 흐름:
  Seller / Admin

- 주 담당 역할:
  Domain

- 보조 역할:
  Seller-FE, Admin-FE, Docs

- 배경:
  pending 상태의 판매자 신청이 있으면 `seller_application_document` 목적의 파일 업로드가 차단되어 신청 제출 후 서류를 수정하거나 재업로드할 수 없다.

- 문제:
  사용자가 잘못된 서류를 제출했을 때 거절 후 재신청 외에는 수정 경로가 없다.

- 작업 내용:
  - pending 신청 취소 API, 신청 수정 API, 서류 교체 API 중 하나를 선택한다.
  - 서류 교체 시 기존 private 파일 보관/삭제 정책을 T06 결정과 맞춘다.
  - 관리자 검토 중 서류 변경 가능 여부와 알림/상태 변경 정책을 정한다.
  - 판매자 UI에서 재업로드 또는 취소/재신청 안내를 제공한다.
  - 거부(rejected) 후 재신청 가능 조건을 확정한다 (횟수 제한, 대기 기간, 재신청 시 기존 서류 처리 등).

- 관련 파일/영역:
  - `src/app/api/seller-applications/*`
  - `src/app/api/files/upload-url/*`
  - `src/hooks/seller/applications/useCreateSellerApplication.ts`
  - `src/app/(seller)/seller/register/*`
  - `src/app/(admin)/admin/sellers/pending/*`

- 예상 난이도:
  중간

- 완료 기준:
  - pending 신청의 서류 수정 가능 여부가 정책으로 확정된다.
  - 선택한 정책에 맞는 API/UI 작업이 분리된다.
  - 민감 문서 보관/삭제 기준이 T06과 충돌하지 않는다.

## 구현 결과

### 정책 결정

- **수정 방식**: pending 신청 취소 후 재신청 (cancel API)
- **취소 가능 조건**: `pending` 상태인 신청만 취소 가능. `approved` / `rejected` 상태에서는 `APPLICATION_CANCEL_NOT_ALLOWED (409)` 반환
- **취소 시 파일 처리**: Storage 파일 즉시 삭제 없음. T06/T41 orphan scanner에 위임
- **관리자 검토 중 취소**: 허용 (pending 상태이므로)
- **rejected 후 재신청**: 횟수/대기기간 제한 없음. `checkApplicationEligibility`가 `pending/approved`만 차단하므로 자동 허용
- **재신청 시 기존 서류**: orphan 처리 (cron scanner 위임)

### 구현 범위

#### 신규 파일

- `src/app/api/seller-applications/me/route.test.ts` — GET/DELETE Route Handler 테스트
- `src/hooks/seller/applications/useCancelSellerApplication.ts` — 신청 취소 mutation hook
- `src/hooks/seller/applications/useCancelSellerApplication.test.ts` — hook 테스트
- `src/components/seller/pending/PendingView.test.tsx` — PendingView 컴포넌트 테스트

#### 수정 파일

- `src/lib/errors/errorCodes.ts` — `APPLICATION_CANCEL_NOT_ALLOWED` 추가
- `src/lib/errors/errorMessages.ts` — `APPLICATION_CANCEL_NOT_ALLOWED` 메시지 추가
- `src/app/api/seller-applications/me/_lib/service.ts` — `cancelMySellerApplication` 함수 추가
- `src/app/api/seller-applications/me/_lib/service.test.ts` — `cancelMySellerApplication` 테스트 추가
- `src/app/api/seller-applications/me/route.ts` — `DELETE` handler 추가
- `src/app/api/_lib/auth.ts` — `rejected` 상태 재신청 허용 주석 명시
- `src/app/api/_lib/auth.test.ts` — `rejected` 신청 eligible true 테스트 추가
- `src/api/seller-applications/sellerApplicationApi.ts` — `cancelMyApplication` 추가
- `src/api/seller-applications/sellerApplicationApi.test.ts` — `cancelMyApplication` 테스트 추가
- `src/components/seller/pending/PendingView.tsx` — 취소 버튼 및 확인 다이얼로그 추가
