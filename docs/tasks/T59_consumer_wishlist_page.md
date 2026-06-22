# T59. 소비자 찜 목록 화면 및 API 구현

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P5

- 선행 조건:
  - 선행 task: T15 (TanStack Query key 및 invalidation factory 도입)

- 분류:
  화면/UI

- 사용자 흐름:
  Consumer

- 주 담당 역할:
  Frontend

- 보조 역할:
  API

- 배경:
  PRD C-MY-04는 관심 가게/상품 저장을 P2 요구사항으로 정의한다. 단, 현재 ERD/API spec은 가게 찜(`wishlists.store_id`)만 정의하므로 이 task는 가게 찜 범위만 구현한다. 상품 찜은 ERD/API spec 미정의로 별도 후속 task가 필요하다. IA 정합성 확인 중 `/mypage/wishlist` 경로가 미구현 상태임을 확인했다.

- 문제:
  소비자가 관심 가게를 저장하고 목록으로 확인할 화면과 API가 없다.

- 작업 내용:
  - `/mypage/wishlist` 찜 목록 페이지 구현
    - 관심 가게 목록 표시 (ERD `wishlists.store_id` 기준)
    - 가게 찜 추가/삭제 인터랙션
  - wishlist API 연결 (`api_spec` 11장 기준)

- 관련 파일/영역:
  - `src/app/(consumer)/mypage/wishlist/`
  - `src/app/api/wishlist/`

- 예상 난이도:
  낮음

- 완료 기준:
  - `/mypage/wishlist`에서 찜한 가게 목록을 확인할 수 있다.
  - 가게 찜 추가/삭제가 동작한다.
  - PRD C-MY-04 중 가게 찜 범위를 충족한다.
  - 상품 찜 ERD/API/화면 확장이 필요하면 T59 작업 중 후속 task를 생성한다.
  - `docs/ia.md`의 `/mypage/wishlist` 항목 상태를 미구현 → 완료로 갱신한다.

- 확인 필요 사항:
  - wishlist API 현재 구현 상태 (`api_spec` 11장 기준)
  - 상품 찜은 현재 ERD/API spec 미정의 — 필요 시 T59 작업 중 후속 task로 분리
