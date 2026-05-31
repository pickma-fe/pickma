# T50. 판매자 심사 대기 화면 구현

- 상태:
  완료

- GitHub Issue:
  180

- 우선순위:
  P1

- 선행 조건:
  - 선행 task: 없음

- 분류:
  화면/UI

- 사용자 흐름:
  Seller

- 주 담당 역할:
  Frontend

- 보조 역할:
  API

- 배경:
  IA 정합성 확인 중 `/seller/pending` 경로가 미구현 상태임을 확인했다. 판매자 신청 후 심사 중인 사용자가 상태를 확인할 수 있는 화면이 필요하다.

- 문제:
  판매자 신청 후 심사 중인 사용자를 위한 전용 화면이 없어, 심사 상태 확인이 불가능하다.

- 작업 내용:
  - `/seller/pending` 페이지 구현
  - 판매자 신청 심사 상태 (pending / rejected) 표시
  - 거절된 경우 재신청 안내 또는 거절 사유 표시
  - 심사 중일 경우 대기 안내 메시지

- 관련 파일/영역:
  - `src/app/(seller)/seller/pending/`
  - `src/api/seller/` (onboarding-status 등 관련 API)

- 예상 난이도:
  낮음

- 완료 기준:
  - `/seller/pending` 화면이 심사 상태에 따라 올바른 내용을 표시한다.
  - 로그인하지 않거나 신청자가 아닌 사용자는 접근 불가 처리된다.

- 확인 필요 사항:
  - 거절 사유를 화면에 표시할지 여부
  - 재신청 가능 조건 및 UX 흐름

- 구현 결과:
  - `/seller/pending` 페이지와 `PendingContent`, `PendingView`, `RejectedView` 컴포넌트 구현.
  - `useSellerOnboardingStatus`를 통해 pending/rejected/approved 상태를 조회하고 상태별 화면을 표시.
  - rejected 상태에서는 `latestRejectReason`을 표시하고, 재신청은 후속 정책/UX 확정 전까지 안내 중심으로 처리.
  - 개발 확인용 query(`status`, `reason`)로 pending/rejected 화면을 확인할 수 있는 경로를 제공.
