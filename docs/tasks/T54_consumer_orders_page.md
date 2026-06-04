# T54. 소비자 주문 내역 정합성 및 마이페이지 기본 화면 정리

- 상태:
  진행 중

- GitHub Issue:
  208

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
  IA 정합성 확인 중 `/mypage/orders`와 `/mypage/orders/[id]` 경로가 미구현 상태로 기록되어 있었으나, 현재 `/mypage`에 주문 API 기반 “내 예약” 목록, 상태 필터, 예약 상세 모달, 픽업 코드 모달이 이미 구현되어 있다. 내 정보와 내 예약은 분리된 resource이므로 `/mypage`는 내 정보 기본 화면으로 두고, 기존 내 예약 구현은 `/mypage/orders` route에서 재사용한다.

- 문제:
  `/mypage` 기본 진입이 내 예약으로 시작되어 마이페이지 진입 시 회원 정보 확인 흐름과 어긋나며, query param 기반 view 전환은 내 정보와 내 예약 route 의미를 흐린다. IA/task 문서도 실제 구현 구조와 맞지 않아 후속 작업자가 중복 구현할 위험이 있다.

- 작업 내용:
  - `/mypage` 기본 진입 화면을 내 정보 화면으로 변경
  - 기존 내 예약 목록/상세/픽업코드 모달 기능은 유지
  - 내 예약은 `/mypage/orders`에서 기존 구현을 재사용
  - `/mypage/profile` 중복 진입 경로 제거
  - 예약 완료/실패 후 “내 예약 보기” 링크를 `/mypage/orders`로 연결
  - IA와 task 문서를 실제 구현 구조에 맞게 갱신

- 관련 파일/영역:
  - `src/app/(consumer)/mypage/page.tsx`
  - `src/app/(consumer)/mypage/orders/page.tsx`
  - `src/app/(consumer)/order/complete/page.tsx`
  - `src/app/(consumer)/order/fail/page.tsx`
  - `src/components/consumer/mypage/`
  - `src/api/orders/` (기존 소비자 주문 목록/상세)
  - `src/hooks/orders/` (기존 소비자 주문 hook)
  - `docs/ia.md`

- 예상 난이도:
  보통

- 완료 기준:
  - `/mypage` 진입 시 내 정보 화면이 먼저 표시된다.
  - `/mypage/orders`에서 기존 내 예약 목록을 확인할 수 있다.
  - 내 예약 상세 모달에서 주문 상세 및 픽업번호를 확인할 수 있다.
  - IA와 task 문서가 실제 구현 구조와 일치한다.

- 확인 필요 사항:
  - 주문 취소 버튼 노출 조건 (T31 취소 API 선행 필요 여부)
  - 결제 대기/만료 주문의 표시 방식
