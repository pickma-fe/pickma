# T77. 판매자 대시보드 매출 통계 구현

- 상태:
  완료

- GitHub Issue:
  285

- 우선순위:
  P3

- 선행 조건:
  - 선행 task: T58. 관리자 대시보드 통계 API 및 UI 구현

- 분류:
  기능

- 사용자 흐름:
  Seller

- 주 담당 역할:
  Seller-FE

- 보조 역할:
  Architecture

- 배경:
  PRD S-DASH-02로 명세된 판매자 대시보드 매출 통계 기능이 미구현 상태다. T58에서 관리자 대시보드 통계가 구현됐으나 판매자 전용 매출 통계 API 및 UI는 포함되지 않았다.

- 문제:
  판매자가 자신의 매출 현황(기간별 매출액, 주문 수, 상품별 통계 등)을 확인할 수 있는 화면이 없다.

- 작업 내용:
  - PRD S-DASH-02 기준으로 노출할 통계 항목을 확정한다 (기간별 매출액, 주문 수 등).
  - `GET /api/seller/dashboard` 판매자 전용 통계 API를 설계하고 구현한다.
  - 판매자 대시보드 화면에 매출 통계 UI를 추가한다.

- 관련 파일/영역:
  - `src/contracts/seller.ts` (신규)
  - `src/app/api/seller/dashboard/route.ts` (신규)
  - `src/app/api/seller/dashboard/_lib/service.ts` (신규)
  - `src/api/seller/dashboard/sellerDashboardApi.ts` (신규)
  - `src/hooks/seller/dashboard/useSellerDashboardStats.ts` (신규)
  - `src/components/seller/dashboard/SalesDashboard.tsx` (신규)
  - `src/components/seller/dashboard/SalesSummaryCards.tsx` (신규)
  - `src/components/seller/dashboard/SalesDailyChart.tsx` (신규)
  - `src/components/seller/dashboard/SalesRecentOrders.tsx` (신규)
  - `src/components/seller/dashboard/DashboardContent.tsx` (수정)
  - `src/lib/queryKeys.ts` (수정)
  - `src/contracts/index.ts` (수정)
  - `src/mocks/seller.ts` (수정)

- 예상 난이도:
  중간

- 완료 기준:
  - 판매자가 자신의 매출 통계를 대시보드에서 조회할 수 있다.
  - PRD S-DASH-02 완료 기준을 충족한다.

- 구현 결과:
  - `GET /api/seller/dashboard` 엔드포인트 구현 (mock/real 모드 분기)
  - 인증: `requireSellerStore` 기반으로 본인 store 데이터만 조회
  - 통계 항목: 누적 매출액, 누적 주문 수, 최근 7일 일별 매출 추이, 최근 주문 5건
  - 집계 기준: `orders.status IN (reserved, accepted, ready, completed, no_show)` 기준
  - 일별 메트릭: 한국 시간(Asia/Seoul) 기준 7일 범위 집계
  - UI: 누적 매출/주문 요약 카드, 7일 막대 차트, 최근 주문 목록을 기존 대시보드 하단에 추가
  - 테스트: service 5개, route 4개 총 9개 통과
