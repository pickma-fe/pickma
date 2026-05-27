# T41. Storage lifecycle 주기적 orphan scanner

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P2

- 선행 조건:
  - 선행 task: T40. Storage orphan cleanup API 및 hook 통합, T43. Vercel 배포 설정 및 Cron 환경 구성

- 분류:
  보안

- 사용자 흐름:
  Shared

- 주 담당 역할:
  Architecture

- 보조 역할:
  Domain

- 배경:
  T40의 best-effort cleanup에서 실패한 파일과 예상치 못한 경로의 orphan 파일을 Vercel Cron으로 주기적으로 스캔해 삭제한다.

- 문제:
  클라이언트 cleanup 실패 시 민감 서류가 `seller-application-documents` bucket에 계속 잔류할 수 있다.

- 작업 내용:
  - `GET /api/cron/storage-cleanup` Vercel Cron 전용 endpoint 구현.
  - 인증: `Authorization: Bearer ${CRON_SECRET}` 확인, 실패 시 401 반환. `CRON_SECRET`은 서버 전용 환경 변수로 관리.
  - bucket 파일 목록과 DB `seller_application_documents.storage_path`를 비교, 30일 초과 orphan 파일 삭제 (service role client 사용).
  - T43에서 확정한 Vercel 배포 설정 기준에 맞춰 Cron 스케줄을 등록한다.

- 관련 파일/영역:
  - `src/app/api/cron/storage-cleanup/route.ts` (신규)
  - `src/app/api/cron/storage-cleanup/_lib/service.ts` (신규)
  - `vercel.json` (T43 기준에 따라 신규 생성 또는 수정)

- 예상 난이도:
  높음

- 완료 기준:
  - Vercel Cron이 주기적으로 `GET /api/cron/storage-cleanup`을 호출한다.
  - 인증 실패 요청은 401로 거부된다.
  - DB에 없는 30일 초과 orphan 파일이 bucket에서 삭제된다.
