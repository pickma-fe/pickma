# T54. 소비자 주문 내역 및 상세 화면 구현

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P1

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
  IA 정합성 확인 중 `/mypage/orders`와 `/mypage/orders/[id]` 경로가 미구현 상태임을 확인했다. PRD C-MY-01, C-MY-02 요구사항에 해당한다.

- 문제:
  소비자가 주문 내역을 확인하거나 특정 주문의 상세 정보(픽업번호 포함)를 볼 수 없다.

- 작업 내용:
  - `/mypage/orders` 주문 내역 목록 페이지 구현
    - 상태별 탭 또는 필터 (예약중/완료/취소)
    - 주문 카드: 상품명, 가게명, 날짜, 상태
  - `/mypage/orders/[id]` 주문 상세 페이지 구현
    - 주문 정보, 픽업번호, 결제 정보, 현재 상태
  - 로그인 guard 적용

- 관련 파일/영역:
  - `src/app/(consumer)/mypage/orders/`
  - `src/app/(consumer)/mypage/orders/[id]/`
  - `src/api/orders/` (소비자 주문 목록/상세)
  - `src/hooks/orders/`

- 예상 난이도:
  보통

- 완료 기준:
  - `/mypage/orders`에서 소비자의 주문 목록을 확인할 수 있다.
  - `/mypage/orders/[id]`에서 주문 상세 및 픽업번호를 확인할 수 있다.

- 확인 필요 사항:
  - 주문 목록 정렬 기준 (최신순)
  - 주문 취소 버튼 노출 조건 (T31 취소 API 선행 필요 여부)
  - 결제 대기/만료 주문의 표시 방식
