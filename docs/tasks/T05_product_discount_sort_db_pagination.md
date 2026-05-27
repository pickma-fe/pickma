# T05. 상품 목록 할인율 필터/정렬 DB pagination 복구

- 상태:
  진행 중

- GitHub Issue:
  166

- 우선순위:
  P0

- 선행 조건:
  - 선행 task: T08. incremental migration 전환 결정

- 분류:
  성능

- 사용자 흐름:
  Customer / Shared

- 주 담당 역할:
  Domain

- 보조 역할:
  Architecture, Customer-FE

- 배경:
  할인율 필터 또는 `discountRate` 정렬 시 Supabase `.range()`를 적용하지 않고 전체 데이터를 가져온 뒤 메모리에서 처리한다.

- 문제:
  상품 수가 늘면 page size가 작아도 전체 active product를 읽게 되어 지도/추천/검색 확장 전에 병목이 된다.

- 작업 내용:
  - `discountRate`, `availableStock`, `displayStatus` 계산을 DB view/RPC/generated column 중 하나로 이전하는 방식을 결정한다.
  - DB 레벨에서 filter/sort/range가 적용되도록 service를 수정한다.
  - 기존 query params와 response contract를 유지 가능한지 확인한다.
  - 할인율 필터/정렬 테스트를 추가한다.

- 구현 메모:
  - `discountRate`는 `products.discount_price`와 `menu_items.original_price`를 함께 사용해야 하므로 generated column보다 RPC에서 계산한다.
  - `discountOption` 또는 `sort=discountRate` 요청은 `list_public_products` RPC가 필터, 정렬, count, limit/offset을 DB에서 처리한다.
  - 기존 query params와 `ProductListResponse` contract는 유지한다.

- 관련 파일/영역:
  - `src/app/api/products/_lib/service.ts`
  - `src/app/api/products/_lib/mapper.ts`
  - `src/contracts/product.ts`
  - `supabase/migrations/*` 또는 현 migration 전략

- 예상 난이도:
  높음

- 완료 기준:
  - 할인율 필터/정렬에서도 DB pagination이 적용된다.
  - 전체 조회 후 메모리 pagination 경로가 제거되거나 명확히 제한된다.
  - 성능 영향과 쿼리 전략이 문서화된다.
