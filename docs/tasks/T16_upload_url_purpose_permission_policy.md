# T16. upload URL purpose별 권한 정책 강화

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P1

- 선행 조건:
  - 선행 task: T07. service role 사용 기준 및 owner scope 테스트 수립, T61. 판매자 신청 서류 문서 타입 정리 (신분증 제거 및 타입명 통일)

- 분류:
  보안

- 사용자 흐름:
  Seller / Customer / Shared

- 주 담당 역할:
  Domain

- 보조 역할:
  Architecture

- 배경:
  `POST /api/files/upload-url`은 purpose별 분기를 하지만 일부 purpose의 store 존재/승인 상태 요구가 명확하지 않다.

- 문제:
  이미지/문서 목적별 권한 기준이 흐려지면 잘못된 bucket/path에 업로드 권한이 발급될 수 있다.

- 작업 내용:
  - `profile_image`, `store_image`, `seller_product_image`, `seller_application_document`별 required role/store 상태 표를 작성한다.
  - `store_image`, `seller_product_image`에 승인된 store 필요 여부를 결정한다.
  - service와 schema validation을 정책에 맞게 수정한다.
  - 권한 테스트를 추가한다.

- 관련 파일/영역:
  - `src/app/api/files/upload-url/route.ts`
  - `src/app/api/files/upload-url/_lib/service.ts`
  - `src/app/api/files/upload-url/_lib/schemas.ts`
  - `src/contracts/file.ts`

- 예상 난이도:
  중간

- 완료 기준:
  - purpose별 권한 정책 표가 문서화된다.
  - 정책에 맞는 Route Handler 테스트가 있다.
