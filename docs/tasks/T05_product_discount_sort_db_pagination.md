# T05. 상품 목록 할인율 필터/정렬 DB pagination 복구

- 상태:
  완료

- GitHub Issue:
  183

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

- 구현 결과:
  - `products` 테이블에 `original_price` (snapshot), `available_stock` (generated NOT NULL), `discount_rate` (generated NOT NULL) 컬럼 추가 (migration: `20260528120000_product_discount_sort_fields.sql`, `20260528140000_product_generated_columns_not_null.sql`)
  - `create_order` RPC를 `products.original_price` snapshot 기준으로 교체 (migration: `20260528130000_fix_create_order_original_price.sql`)
  - `getProducts` 함수의 `shouldUseExtendedList` 분기 제거, 모든 조회에 DB `.range()` 페이지네이션 적용
  - `discountOption` 필터 → DB `gte`/`lt` 쿼리, `discountRate` 정렬 → DB `order('discount_rate')` 적용
  - mapper에서 `availableStock`, `discountRate`, `originalPrice`를 DB 컬럼에서 직접 읽도록 변경
  - 검증: vitest 72개 통과, TypeScript check 통과
  - 수동 검증 (seed 데이터 기준):
    - `GET /api/products?discountOption=over-40&page=2&pageSize=5` → totalCount: 79, items 5개 모두 discountRate ≥ 40 (46–49%)
    - `GET /api/products?sort=discountRate&order=desc&page=1&pageSize=5` → totalCount: 101, items 5개 모두 discountRate: 50 (최고값 내림차순)
