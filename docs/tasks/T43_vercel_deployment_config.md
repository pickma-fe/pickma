# T43. Vercel 배포 설정 및 Cron 환경 구성

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P2

- 선행 조건:
  - 선행 task: 없음

- 분류:
  DevOps

- 사용자 흐름:
  Shared

- 주 담당 역할:
  Architecture

- 보조 역할:
  Domain, DevOps

- 배경:
  T41 Storage lifecycle 주기적 orphan scanner는 Vercel Cron과 서버 전용 환경 변수를 필요로 한다. 현재 task board에는 GitHub Actions 기반 CI(T24)는 있으나 Vercel 배포 설정, Cron 등록, preview/production 환경 변수 기준을 다루는 task가 없다.

- 문제:
  `vercel.json`, `CRON_SECRET`, preview/production 환경 변수 운영 기준이 명확하지 않으면 Cron endpoint 구현 이후에도 배포 환경에서 안전하게 동작하는지 검증하기 어렵다.

- 작업 내용:
  - `vercel.json` 생성 여부와 기본 설정 범위를 결정한다.
  - Vercel Cron 설정 구조를 확립하고 T41의 `GET /api/cron/storage-cleanup` 호출 스케줄을 등록할 수 있게 준비한다.
  - `CRON_SECRET` 등 서버 전용 환경 변수의 Vercel 등록 기준을 정리한다.
  - preview/production 환경 분리 기준과 mock/real 환경 변수 관리 기준을 문서화한다.
  - 배포 후 Cron 인증 실패/성공 확인 방법을 정리한다.

- 관련 파일/영역:
  - `vercel.json` (신규 가능)
  - Vercel project settings
  - `docs/system_architecture.md`
  - `docs/tasks/T41_storage_lifecycle_cron.md`

- 예상 난이도:
  낮음

- 완료 기준:
  - Vercel 배포 설정 파일과 project settings 기준이 문서화된다.
  - T41에서 사용할 Cron schedule과 `CRON_SECRET` 운영 기준이 확정된다.
  - preview/production 환경 변수 분리 기준이 명확하다.
  - T41이 이 task를 선행 조건으로 참조한다.
