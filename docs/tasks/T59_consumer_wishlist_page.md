# T59. 소비자 찜 목록 화면 및 API 구현

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P2

- 선행 조건:
  - 선행 task: 없음

- 분류:
  화면/UI

- 사용자 흐름:
  Consumer

- 주 담당 역할:
  Frontend

- 보조 역할:
  API

- 배경:
  PRD C-MY-04에서 찜 목록(관심 가게 저장)을 P2 요구사항으로 정의한다. IA 정합성 확인 중 `/mypage/wishlist` 경로가 미구현 상태임을 확인했다. api_spec 11장에도 wishlist API가 명세되어 있다. 상품 찜은 현재 ERD/API spec 미정의이므로 이 task는 가게 찜 범위만 다루며, 상품 찜은 별도 후속 task가 필요하다.

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
  - PRD C-MY-04 중 가게 찜 범위를 충족한다 (상품 찜은 ERD/API spec 미정의 — 후속 task).

- 확인 필요 사항:
  - wishlist API 현재 구현 상태 (`api_spec` 11장 기준)
  - 상품 찜은 현재 ERD/API spec 미정의 — 필요 시 후속 task로 분리
