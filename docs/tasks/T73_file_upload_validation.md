# T73. 파일 업로드 MIME type·크기 검증 강화

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P3

- 선행 조건:
  T16, T40

- 분류:
  보안

- 사용자 흐름:
  Shared

- 주 담당 역할:
  Backend

- 보조 역할:
  없음

- 배경:
  파일 업로드 presigned URL 발급 Route Handler(`/api/files/upload-url`)에 MIME type 검증과 파일 크기 제한이 없다. 악의적 파일 업로드 및 스토리지 DoS 공격에 노출될 수 있다.

- 문제:
  `src/app/api/files/upload-url/route.ts` 및 `src/app/api/files/_lib/schemas.ts`에 `contentType`/`fileSize` 유효성 검사가 없다. Supabase Storage presigned URL 발급 시 허용 MIME type과 크기 상한을 강제하지 않는다.

- 작업 내용:
  - 업로드 용도별(판매자 서류, 상품 이미지 등) 허용 MIME type 목록과 파일 크기 상한을 정의한다.
  - `schemas.ts`에 `contentType`(allowlist 검증)과 `fileSize`(상한 검증) 필드를 추가한다.
  - Route Handler에서 검증 실패 시 `400 INVALID_FILE_TYPE` / `413 FILE_TOO_LARGE` 응답을 반환한다.
  - Supabase Storage presigned URL 생성 시 `contentType`을 전달하여 Storage 레벨에서도 제한이 걸리도록 한다.
  - Supabase 버킷 정책(크기 상한)과의 정합성을 확인한다.

- 관련 파일/영역:
  - `src/app/api/files/upload-url/route.ts`
  - `src/app/api/files/_lib/schemas.ts`
  - `src/app/api/files/_lib/service.ts`

- 예상 난이도:
  낮음~중간

- 완료 기준:
  - 허용되지 않는 MIME type 요청 시 400 반환.
  - 크기 상한 초과 요청 시 413 반환.
  - Supabase Storage presigned URL에 contentType이 명시된다.
  - `tsc --noEmit`, lint 통과.
