# T19. 문서 baseline 정합성 및 지속 갱신 규칙 정리

- 상태:
  완료

- GitHub Issue:
  #169

- 우선순위:
  P0

- 선행 조건:
  - 선행 task: 없음

- 분류:
  문서

- 사용자 흐름:
  Shared

- 주 담당 역할:
  Docs

- 보조 역할:
  Domain, Architecture

- 배경:
  심화 프로젝트 착수 전에 기준 문서의 baseline 정합성을 먼저 맞춰야 한다. 이후 심화 프로젝트 진행 중에도 API, Domain, DB, 사용자 흐름이 바뀔 때마다 관련 문서가 함께 갱신되어야 한다.

  Harness 관점 (H5): 에이전트가 오래된 docs를 기준으로 코드를 만들 위험이 있다. 기록 시스템이 시간이 지나면 드리프트한다.

- 문제:
  문서가 한 번 정리된 뒤 다시 방치되면 팀원이나 에이전트가 오래된 타입, 상태 전이, API 명세를 기준으로 구현할 수 있다.

- 작업 내용:
  - 심화 프로젝트 착수 전 기준 문서 baseline을 먼저 정리한다.
  - `docs/domain.md`의 `Product.pickupStartTime/pickupEndTime`을 `HH:mm:ss` string으로 수정한다.
  - `docs/prd.md` 주문 상태 표에 `PROCESSING`을 반영한다.
  - `docs/erd.md` stores 섹션의 실제 migration 불일치(reject_reason 제거)를 정리한다.
  - `docs/api_spec.md`의 `PATCH /api/stores/me` 상세 명세 섹션을 추가한다.
  - `docs/ia.md`를 최신화하여 실제 구현된 경로를 반영하고 미구현 현황을 표기한다.
  - 각 task 완료 시 관련 `docs/*` 수정 필요 여부를 확인하는 운영 규칙은 이미 `AGENTS.md`와 `docs/tasks/README.md`에 존재하므로 별도 추가 불필요.
  - doc drift 자동화(script/CI check)는 이번 task에서는 발견된 drift를 문서에 반영하고 `rg` 기반 수동 검증으로 확인한다. 지속형 자동화는 T24 또는 별도 후속 task 범위.

- 관련 파일/영역:
  - `docs/domain.md`
  - `docs/prd.md`
  - `docs/erd.md`
  - `docs/api_spec.md`
  - `docs/ia.md`
  - `docs/tasks/T50~T59_*.md` (신규 생성)

- 예상 난이도:
  낮음

- 완료 기준:
  - 심화 프로젝트 착수 전 기준 문서의 핵심 타입/상태/테이블 정보가 코드와 일치한다.
  - 이후 task 진행 중 문서를 함께 갱신하는 운영 규칙이 이미 문서화되어 있음을 확인한다.
  - doc drift는 이번 task에서 `rg` 수동 검증으로 확인하고, 지속형 자동화는 T24에서 다룬다.
  - T50–T59 task 문서가 `docs/tasks/`에 존재하고 README.md에 등록된다.
