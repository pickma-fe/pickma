# T28. 판매자 상품 수정 진입점 결정 및 구현

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P2

- 선행 조건:
  - 선행 task: T15. TanStack Query key 및 invalidation factory 도입

- 분류:
  UI

- 사용자 흐름:
  Seller

- 주 담당 역할:
  Seller-FE

- 보조 역할:
  Shared-FE

- 배경:
  상품 등록은 `/seller/menu` modal로 정리되었지만 상품 수정 진입점은 별도 페이지와 modal 사이에서 미정이다.

- 문제:
  상품 운영 중 가격/수량/픽업 시간 수정 흐름이 일관되지 않을 수 있다.

- 작업 내용:
  - 수정 진입점 정책을 결정한다.
  - 결정에 따라 상품 목록 액션과 form 재사용 구조를 구현한다.
  - 접근성, loading/error, optimistic update 여부를 정한다.

- 관련 파일/영역:
  - `src/app/(seller)/seller/products/*`
  - `src/app/(seller)/seller/menu/_components/ProductRegistrationModal.tsx`
  - `src/hooks/seller/products/useUpdateSellerProduct.ts`

- 예상 난이도:
  중간

- 완료 기준:
  - 판매자가 기존 상품을 명확한 진입점에서 수정할 수 있다.
  - 등록/수정 form 재사용 범위가 정리된다.
  - `PATCH /api/seller/products/{productId}/stock` endpoint가 구현되고 `NOT_IMPLEMENTED` 반환 코드가 제거된다. (T09 기준: 재고 조정 기능 범위 포함 여부는 T28 실행 시 재확인)
