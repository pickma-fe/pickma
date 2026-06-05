# T40. Storage orphan cleanup API 및 hook 통합

- 상태:
  완료

- GitHub Issue:
  235

- 우선순위:
  P1

- 선행 조건:
  - 선행 task: T06

- 분류:
  보안

- 사용자 흐름:
  Seller / Shared

- 주 담당 역할:
  Domain

- 보조 역할:
  Architecture

- 배경:
  T06에서 확정한 Storage lifecycle 정책에 따라 클라이언트 best-effort cleanup과 신청 거부 시 서버 cleanup을 구현한다.

- 문제:
  도메인 API 실패 시 업로드된 민감 서류가 `seller-application-documents` bucket에 orphan 상태로 잔류한다.

- 작업 내용:
  - `DELETE /api/files` cleanup endpoint 구현: `{ storagePaths: string[] }` body, `requireActiveUser()` 인증, userId prefix로 소유권 검증, service role client로 storage 삭제.
  - `useCreateSellerApplication` hook `mutationFn` catch에서 업로드 성공 파일의 `storagePath` 목록으로 cleanup API 호출 (best-effort, 실패 시 로깅만).
  - `POST /api/admin/sellers/:id/reject` Route Handler에서 서류 파일 best-effort cleanup (실패 시 로깅만, cron이 안전망 역할). `:id`는 seller application id이며 내부 dynamic segment는 `[applicationId]`로 정리한다.
  - admin seller application Route Handler dynamic segment를 실제 의미에 맞게 `[id]`에서 `[applicationId]`로 rename하고 관련 params/service 파라미터명을 정리한다.

- 관련 파일/영역:
  - `src/app/api/files/route.ts` (신규)
  - `src/app/api/files/_lib/service.ts` (신규 또는 수정)
  - `src/hooks/seller/applications/useCreateSellerApplication.ts`
  - `src/app/api/admin/sellers/[applicationId]/reject/route.ts` (rename)
  - `src/app/api/admin/sellers/[applicationId]/approve/route.ts` (rename)
  - `docs/api_spec.md`

- 예상 난이도:
  중간

- 완료 기준:
  - `DELETE /api/files` endpoint가 구현되고 소유권 검증이 통과한다.
  - `useCreateSellerApplication` 실패 시 업로드 파일이 best-effort로 cleanup된다.
  - 신청 거부 시 서류 파일이 best-effort로 cleanup된다.
  - admin seller application approve/reject endpoint의 dynamic segment와 내부 변수명이 `applicationId` 기준으로 정리된다.

- 구현 결과:
  - `src/app/api/admin/sellers/[applicationId]/` 폴더 rename 완료, schemas.ts `paramsApplicationIdSchema`로 정리.
  - `src/app/api/files/route.ts` (DELETE), `_lib/service.ts` (deleteStorageFiles), `_lib/schemas.ts` (deleteFilesSchema) 신규 구현. userId prefix 소유권 검증 + service role client 삭제.
  - `src/api/apiClient.ts` delete body 지원, `src/api/files/fileApi.ts` deleteFiles 추가.
  - `useCreateSellerApplication` Promise.allSettled 전환 + best-effort cleanup 구현.
  - `rejectSellerApplication` DB reject 성공 후 seller_application_documents 경로 조회 + storage best-effort cleanup 구현.
  - `docs/api_spec.md` 3.2절 DELETE /api/files 명세 추가.
  - 전체 876개 테스트 통과.
