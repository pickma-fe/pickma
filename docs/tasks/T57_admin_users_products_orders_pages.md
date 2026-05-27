# T57. 관리자 사용자·상품·주문 관리 화면 구현

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P3

- 선행 조건:
  - 선행 task: T04 (관리자 가게 목록 real endpoint 및 화면 구현)

- 분류:
  화면/UI

- 사용자 흐름:
  Admin

- 주 담당 역할:
  Frontend

- 보조 역할:
  API

- 배경:
  IA 정합성 확인 중 `/admin/users`, `/admin/products`, `/admin/orders` 경로가 미구현 상태임을 확인했다. PRD A-USER-01, A-PROD-01, A-ORDER-01 요구사항에 해당한다. 성격이 다른 3개 화면을 우선 하나의 task로 등록하며, 착수 시 규모에 따라 T58/T59 등으로 분리 가능하다.

- 문제:
  관리자가 사용자 목록, 전체 상품 목록, 전체 주문 목록을 확인할 화면이 없다.

- 작업 내용:
  - `/admin/users` 사용자 관리 페이지 구현
    - 사용자 목록 테이블
    - 계정 상태(활성/정지) 관리
  - `/admin/products` 상품 관리 페이지 구현
    - 전체 상품 목록 테이블
    - 상품 상태 확인
  - `/admin/orders` 주문 관리 페이지 구현
    - 전체 주문 목록 테이블
    - 주문 상태 확인
  - 관리자 권한 guard 적용 (모든 페이지)

- 관련 파일/영역:
  - `src/app/(admin)/admin/users/`
  - `src/app/(admin)/admin/products/`
  - `src/app/(admin)/admin/orders/`
  - `src/api/admin/` (사용자/상품/주문 조회 API)

- 예상 난이도:
  보통

- 완료 기준:
  - 각 관리자 페이지에서 목록을 확인할 수 있다.
  - 관리자 권한이 없는 사용자는 접근 불가 처리된다.

- 확인 필요 사항:
  - 3개 화면의 별도 task 분리 여부 (착수 시 결정)
  - pagination 방식 (무한 스크롤 vs 페이지네이션)
  - 사용자 계정 정지/활성화 API 엔드포인트 현재 구현 상태
  - 상품/주문 관리자 전용 API 현재 구현 상태
