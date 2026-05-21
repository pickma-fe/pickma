# T26. 운영 화면 summary/list API 분리

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P2

- 선행 조건:
  - 선행 task: T04. 관리자 가게 목록 real endpoint 및 화면 구현

- 분류:
  성능

- 사용자 흐름:
  Seller / Admin

- 주 담당 역할:
  Domain

- 보조 역할:
  Seller-FE, Admin-FE

- 배경:
  판매자/관리자 운영 화면은 목록, 검색, 필터, 상태별 count가 함께 필요하다.

- 문제:
  전체 목록을 내려받아 client에서 count/filter/pagination하면 데이터 증가 시 병목이 된다.

- 작업 내용:
  - seller orders/products, admin stores/orders/users의 list와 summary 책임을 분리한다.
  - list response meta 또는 별도 summary endpoint 중 표준을 정한다.
  - server-side filter/sort/pagination contract를 문서화한다.

- 관련 파일/영역:
  - `src/app/api/seller/orders/*`
  - `src/app/api/seller/products/*`
  - `src/app/api/admin/*`
  - `src/contracts/admin.ts`
  - `src/contracts/order.ts`

- 예상 난이도:
  중간

- 완료 기준:
  - 운영 화면의 count/summary가 전체 client list 계산에 의존하지 않는다.
  - API contract가 재사용 가능한 형태로 정리된다.
