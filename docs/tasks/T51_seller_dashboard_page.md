# T51. 판매자 대시보드 메인 화면 구현

- 상태:
  완료

- GitHub Issue:
  202

- 우선순위:
  P1

- 선행 조건:
  - 선행 task: T10 (판매자 운영 상태 정책 및 구현), T15 (TanStack Query key 및 invalidation factory 도입)

- 분류:
  화면/UI

- 사용자 흐름:
  Seller

- 주 담당 역할:
  Frontend

- 보조 역할:
  API

- 배경:
  IA 정합성 확인 중 `/seller/dashboard` 경로가 미구현 상태임을 확인했다. 승인된 판매자+가게 보유자를 위한 대시보드가 필요하다. `/seller`는 랜딩/온보딩 CTA이며 `/seller/dashboard`는 승인된 판매자 전용 대시보드다. 후속 IA 결정에서 두 경로가 통합될 수 있음.

- 문제:
  승인된 판매자가 오늘의 주문 현황, 매출 통계 등을 한눈에 확인할 수 있는 대시보드가 없다.

- 작업 내용:
  - `/seller/dashboard` 페이지 구현
  - 오늘의 주문 현황 (예약/준비중/픽업완료/취소) 카운트 표시
  - 주문 목록으로 빠른 이동 링크
  - 판매자+가게 권한 guard 적용

- 관련 파일/영역:
  - `src/app/(seller)/seller/dashboard/`
  - `src/api/seller/orders` (오늘의 주문 요약)

- 예상 난이도:
  보통

- 완료 기준:
  - `/seller/dashboard` 화면이 오늘의 주문 현황을 올바르게 표시한다.
  - 판매자+가게 권한이 없는 사용자는 접근 불가 처리된다.

- 확인 필요 사항:
  - `/seller/dashboard`와 `/seller` 통합 여부 (후속 IA 결정)
  - 대시보드 표시 데이터 범위 (오늘 기준 vs 최근 N일)
  - 매출 통계 포함 여부 (PRD S-DASH-02는 P2)
