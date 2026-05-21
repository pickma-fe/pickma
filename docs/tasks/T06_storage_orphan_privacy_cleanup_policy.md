# T06. Storage orphan 및 개인정보 cleanup 정책 확정

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P0

- 선행 조건:
  - 선행 task: 없음

- 분류:
  보안

- 사용자 흐름:
  Seller / Shared

- 주 담당 역할:
  Domain

- 보조 역할:
  Architecture, Docs

- 배경:
  판매자 신청 문서 업로드 중 일부만 성공하거나 신청 API가 실패하면 민감 파일이 private bucket에 남을 수 있다.

- 문제:
  신분증, 통장 사본 등 민감 자료의 고아 파일이 보관 기간 없이 잔류할 수 있다.

- 작업 내용:
  - 업로드 성공 후 도메인 API 실패 시 cleanup 방식 결정.
  - 주기적 orphan cleanup job 또는 cleanup API 필요 여부 결정.
  - 문서 보관 기간, 삭제 요청 처리 기준, lifecycle 정책을 문서화.
  - P1/P2 구현 task로 API/job 작업을 분리.

- 관련 파일/영역:
  - `src/hooks/seller/applications/useCreateSellerApplication.ts`
  - `src/app/api/files/upload-url/*`
  - `docs/system_architecture.md`

- 예상 난이도:
  중간

- 완료 기준:
  - Storage cleanup 책임과 타이밍이 결정된다.
  - 개인정보 보관/삭제 정책이 문서화된다.
  - 구현 작업 목록이 API/job/UI 단위로 분해된다.
