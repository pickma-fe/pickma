# T15. TanStack Query key 및 invalidation factory 도입

- 상태:
  완료

- GitHub Issue:
  190

- 우선순위:
  P1

- 선행 조건:
  - 선행 task: T02. 판매자 주문 관리 real API 연결

- 분류:
  아키텍처

- 사용자 흐름:
  Shared

- 주 담당 역할:
  Shared-FE

- 보조 역할:
  Domain

- 배경:
  query key와 mutation invalidate가 hook마다 흩어져 있다.

- 문제:
  결제 성공, 주문 상태 전이, 상품 재고 변경 후 일부 cache가 stale로 남을 수 있다.

  Harness 관점: query key factory는 코드 품질뿐 아니라 에이전트의 작업 성공률을 높이는 map 역할을 한다. mutation 후 어떤 cache를 갱신해야 하는지 매번 주변 코드를 탐색하지 않아도 된다.

- 작업 내용:
  - `queryKeys` factory 위치를 정한다.
  - products/orders/seller/admin key 구조를 표준화한다.
  - mutation별 invalidate 정책을 한 곳에서 재사용한다.
  - 결제 성공 후 product detail/list, my orders invalidate를 명시한다.

- 관련 파일/영역:
  - `src/hooks/**/*`
  - `src/api/**/*`
  - `src/app/providers.tsx`

- 예상 난이도:
  중간

- 완료 기준:
  - 주요 server state hook이 공통 query key factory를 사용한다.
  - 주문/결제/상품 mutation의 invalidate 대상이 일관된다.
  - 관련 hook 테스트가 갱신된다.

- 구현 결과:
  - `src/lib/queryKeys.ts` 신규 생성
  - 전환된 hook 목록:
    - `src/hooks/auth/` - useAuthSession, useEmailLogin, useEmailSignup, useCompleteEmailSignup, useSignOut
    - `src/hooks/users/` - useMe, useUpdateMe
    - `src/hooks/stores/` - useMyStore, useCreateStore, useUpdateStore
    - `src/hooks/categories/` - useCategories
    - `src/hooks/products/` - useProduct, useProducts, useCreateSellerProduct, useUpdateSellerProduct, useDeleteSellerProduct, useUpdateSellerProductStock, useSellerProducts
    - `src/hooks/orders/` - useOrder, useOrders, useCreateOrder, useCancelOrder
    - `src/hooks/payments/` - useConfirmPayment, useCancelPayment, usePayment
    - `src/hooks/seller/orders/` - useSellerOrder, useSellerOrders, useAcceptSellerOrder, useMarkSellerOrderReady, useCompleteSellerOrder, useNoShowSellerOrder
    - `src/hooks/seller/menu-items/` - useSellerMenuItems, useCreateSellerMenuItem, useUpdateSellerMenuItem, useDeleteSellerMenuItem
    - `src/hooks/seller/onboarding/` - useSellerOnboardingStatus
    - `src/hooks/seller/applications/` - useCreateSellerApplication
    - `src/hooks/admin/sellers/` - useAdminPendingSellerApplications, useApproveSellerApplication, useRejectSellerApplication
  - 확정된 key 구조:
    - `['auth', 'session']`
    - `['users', 'me']`
    - `['stores', 'my']`
    - `['categories', 'list', 'all']`
    - `['products', 'list', params]`, `['products', 'detail', id]`, `['products', 'seller', 'list']`
    - `['orders', 'list', query]`, `['orders', 'detail', id]`
    - `['seller', 'orders', 'list', params]`, `['seller', 'orders', 'detail', id]`
    - `['seller', 'menu-items', params]`
    - `['seller', 'onboarding-status']`
    - `['admin', 'sellers', 'pending', params]`
    - `['admin', 'stores', 'list', params]`
  - invalidateTargets 확정:
    - `afterPaymentSuccess` - orders.lists, products.lists, products.details, products.sellerList
    - `afterCreateOrder` - orders.lists, products.lists, products.details
    - `afterCancelOrder` - orders.lists, orders.details
    - `afterConfirmPayment` - orders.lists, orders.details, products.lists, products.details
    - `afterCancelPayment` - orders.lists, orders.details
  - 테스트 갱신 파일:
    - useEmailLogin.test.ts, useSignOut.test.ts, useMe.test.ts
    - useCreateStore.test.ts, useProduct.test.ts, useProducts.test.ts
    - sellerOrders.test.ts, useCreateSellerApplication.test.ts, usePayment.test.ts
