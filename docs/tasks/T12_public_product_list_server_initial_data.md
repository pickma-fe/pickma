# T12. 공개 상품 목록 Server Component 초기 데이터 전환

- 상태:
  진행 중

- GitHub Issue:
  165

- 우선순위:
  P1

- 선행 조건:
  - 선행 task: T05. 상품 목록 할인율 필터/정렬 DB pagination 복구

- 분류:
  성능

- 사용자 흐름:
  Customer

- 주 담당 역할:
  Customer-FE

- 보조 역할:
  Architecture, Domain

- 배경:
  홈 page 전체가 client component이고 상품/카테고리 fetch가 hydration 이후 브라우저에서 시작된다.

- 문제:
  SEO, LCP, 모바일 초기 로딩, 캐시 효율이 낮다.

- 작업 내용:
  - `/` page를 Server Component로 전환한다.
  - 초기 상품/카테고리 데이터를 서버에서 가져와 client filter shell에 `initialData`로 전달한다.
  - browser-only filter/search 상태는 client island로 분리한다.
  - 60초 interval refetch와 만료 timeout refetch 정책을 재평가한다.

- 관련 파일/영역:
  - `src/app/(consumer)/page.tsx`
  - `src/hooks/products/useProducts.ts`
  - `src/hooks/categories/useCategories.ts`
  - `src/api/products/productApi.ts`

- 예상 난이도:
  높음

- 완료 기준:
  - 초기 상품 목록이 서버 렌더링 경로에서 준비된다.
  - 상호작용 영역만 client component로 남는다.
  - refetch 정책이 문서화되거나 코드 주석으로 설명된다.
