# T57. 관리자 사용자·상품·주문 관리 화면 구현

- 상태:
  완료

- GitHub Issue:
  245

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
  IA 정합성 확인 중 `/admin/users`, `/admin/products`, `/admin/orders` 경로가 미구현 상태임을 확인했다. PRD A-USER-01, A-PROD-01, A-ORDER-01 요구사항에 해당한다. 성격이 다른 3개 화면을 우선 하나의 task로 등록하며, 착수 시 규모에 따라 후속 task로 분리 가능하다.

- 문제:
  관리자가 사용자 목록, 전체 상품 목록, 전체 주문 목록을 확인할 화면이 없다.

- 작업 내용:
  - `/admin/users` 사용자 관리 페이지 구현
    - 사용자 목록 테이블
    - 계정 상태(활성/정지) 확인 및 필터
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
  - `/admin/users`, `/admin/products`, `/admin/orders`는 T57 범위에서 함께 구현한다.
  - pagination 방식은 기존 관리자 가게 목록과 동일한 페이지네이션으로 통일한다.
  - 사용자 계정 정지/활성화 API는 정책/audit 기준 확정 전까지 운영 UI에 노출하지 않는다.
  - 상품/주문 관리자 전용 API는 목록 조회 endpoint를 우선 구현한다.

- 구현 결과:
  - `/admin/users` 사용자 관리 페이지를 구현했다.
    - 사용자 목록, 검색, 역할 필터, 계정 상태 필터, 페이지네이션을 제공한다.
  - `/admin/products` 상품 관리 페이지를 구현했다.
    - 전체 상품 목록, 상품명/가게명 검색, 상품 상태 필터, 페이지네이션을 제공한다.
  - `/admin/orders` 주문 관리 페이지를 구현했다.
    - 전체 주문 목록, 주문번호/픽업번호 검색, 주문 상태 필터, 주문일/픽업일 정렬, 페이지네이션을 제공한다.
  - `GET /api/admin/users`, `GET /api/admin/products`, `GET /api/admin/orders` 관리자 전용 Route Handler와 client API/hook을 추가했다.
  - 모든 신규 관리자 API는 mock/real mode 모두 `requireAdmin()`을 통과하도록 고정했다.
  - 사용자 상태 변경은 endpoint 정책 확인 전까지 버튼으로 노출하지 않고 상태 확인만 제공한다.
  - `docs/ia.md`, `docs/api_spec.md`, `docs/tasks/README.md`를 구현 상태에 맞게 갱신했다.
