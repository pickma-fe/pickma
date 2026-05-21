# T19. 문서 baseline 정합성 및 지속 갱신 규칙 정리

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

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
  - `docs/prd.md` 주문 상태 표에 `processing`을 반영한다.
  - `docs/erd.md` stores 섹션의 실제 migration 불일치를 정리한다.
  - `docs/api_spec.md`의 `PATCH /api/stores/me` 누락 여부를 재확인한다.
  - 기존 문서 최신화 TODO의 오래된 항목을 완료/수정 처리한다.
  - 각 task 완료 시 관련 `docs/*` 수정 필요 여부를 확인하는 운영 규칙을 정한다.
  - 문서 수정이 필요한데 해당 task에서 끝내기 어렵다면 후속 task 또는 `확인 필요` 항목으로 남기는 기준을 정한다.
  - 최소 doc drift check를 추가한다: `rg "pickupStartTime: Date"`, `rg "reject_reason"` 등 코드와 불일치하는 표현을 잡는 스크립트 또는 CI check (Harness H5).
  - `src/contracts`와 docs snippet의 주요 타입 이름 존재 여부를 확인하는 check를 추가한다.

- 관련 파일/영역:
  - `docs/domain.md`
  - `docs/prd.md`
  - `docs/erd.md`
  - `docs/api_spec.md`

- 예상 난이도:
  낮음

- 완료 기준:
  - 심화 프로젝트 착수 전 기준 문서의 핵심 타입/상태/테이블 정보가 코드와 일치한다.
  - 이후 task 진행 중 문서를 함께 갱신하는 운영 규칙이 문서화된다.
  - 이미 완료된 TODO가 다시 작업 대상으로 남지 않는다.
  - doc drift check script 또는 CI check가 존재한다.
