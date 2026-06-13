# T76. Route Handler·Hook 테스트 보강

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P3

- 선행 조건:
  T24

- 분류:
  테스트

- 사용자 흐름:
  Shared

- 주 담당 역할:
  Backend

- 보조 역할:
  Customer-FE, Seller-FE

- 배경:
  핵심 비즈니스 플로우(주문 취소, 알림, no-show 처리 등)를 담당하는 Route Handler와 hook에 단위·통합 테스트가 없다. 회귀 위험이 높은 코드가 테스트 없이 운영 중이다.

- 문제:
  아래 Route Handler와 hook에 Vitest 기반 테스트가 없다.

  Route Handler (통합 테스트 우선):
  - `src/app/api/seller/orders/[orderId]/no-show/route.ts` (높음)
  - `src/app/api/seller/products/[productId]/stock/route.ts` (높음)
  - `src/app/api/seller-applications/me/route.ts` (중간)
  - `src/app/api/seller-applications/me/documents/[documentId]/route.ts` (중간)
  - `src/app/api/seller/menu-items/[menuItemId]/route.ts` (중간)
  - `src/app/api/admin/users/` getAdminUsers service (중간)

  Hook (단위 테스트 우선):
  - `src/hooks/orders/useCancelOrder.ts` (높음)
  - `src/hooks/orders/useOrders.ts`, `useOrder.ts` (높음)
  - `src/hooks/notifications/useOrderStatusNotification.ts` (높음)
  - `src/hooks/notifications/useSellerNewOrderNotification.ts` (높음)
  - `src/hooks/seller/products/useSellerProduct.ts`, `useSellerProducts.ts` (중간)
  - `src/hooks/seller/applications/useMySellerApplication.ts` (중간)
  - `src/hooks/auth/useResetPassword.ts`, `useUpdatePassword.ts` (중간)

- 작업 내용:
  - 중요도 높음 항목부터 우선 작성한다.
  - Route Handler 테스트는 service 단위 테스트 또는 route 통합 테스트로 작성한다.
  - Hook 테스트는 TanStack Query의 `renderHook`과 mock API 응답을 활용한다.
  - 기존 테스트 파일 컨벤션(`*.test.ts`)을 따른다.

- 관련 파일/영역:
  - `src/app/api/seller/orders/[orderId]/no-show/`
  - `src/app/api/seller/products/[productId]/stock/`
  - `src/app/api/seller-applications/me/`
  - `src/app/api/admin/users/`
  - `src/hooks/orders/`
  - `src/hooks/notifications/`
  - `src/hooks/seller/`
  - `src/hooks/auth/`

- 예상 난이도:
  중간

- 완료 기준:
  - 중요도 높음 Route Handler 2건, hook 4건 이상 테스트 추가.
  - `npm run test` 전체 통과.
