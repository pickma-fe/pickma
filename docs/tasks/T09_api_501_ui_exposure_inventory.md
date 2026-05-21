# T09. 501 API 및 UI 노출 목록 정리

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P0

- 선행 조건:
  - 선행 task: 없음

- 분류:
  테스트

- 사용자 흐름:
  Customer / Seller / Admin

- 주 담당 역할:
  Architecture

- 보조 역할:
  Domain, Docs

- 배경:
  일부 endpoint는 hook/client wrapper가 있지만 real mode에서 501 또는 NOT_IMPLEMENTED를 반환한다.

- 문제:
  mock에서는 동작하지만 real에서는 실패하는 버튼이 운영 UI에 노출될 수 있다.

- 작업 내용:
  - 501/NOT_IMPLEMENTED endpoint 목록을 최신화한다.
  - 현재 UI에서 노출되는 버튼/링크와 연결 여부를 확인한다.
  - P0 구현 대상과 P2/P3 미노출 대상을 분리한다.
  - 노출 금지 또는 disabled reason 정책을 정한다.
  - `rg "NOT_IMPLEMENTED"` 기반으로 501 endpoint 목록과 UI 연결 여부를 비교하는 check script를 추가한다.

- 관련 파일/영역:
  - `src/app/api/orders/[orderId]/cancel/route.ts`
  - `src/app/api/payments/[paymentId]/cancel/*`
  - `src/app/api/seller/products/[productId]/stock/*`
  - `src/app/api/seller/orders/[orderId]/no-show/*`
  - `src/app/api/users/me/route.ts`

- 예상 난이도:
  낮음

- 완료 기준:
  - 최신 501 목록과 UI 노출 여부가 문서화된다.
  - 실운영 화면에 실패가 확정된 액션이 무방비로 노출되지 않는다.
  - `rg "NOT_IMPLEMENTED"` 기반 501 check script가 존재하거나 CI에 포함된다.
