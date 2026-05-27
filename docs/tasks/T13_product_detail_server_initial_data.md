# T13. 상품 상세 Server Component 초기 데이터 전환

- 상태:
  진행 중

- GitHub Issue:
  167

- 우선순위:
  P1

- 선행 조건:
  - 선행 task: 없음
  - 관련 task: T12. 공개 상품 목록 Server Component 초기 데이터 전환과 병행 가능

- 분류:
  성능

- 사용자 흐름:
  Customer

- 주 담당 역할:
  Customer-FE

- 보조 역할:
  Architecture

- 배경:
  상품 상세 page는 server file이지만 실제 상품 데이터는 client container의 `useProduct()`에서 가져온다.

- 문제:
  상품명/이미지/가격이 서버 HTML에 없어 공유 링크와 SEO 품질이 낮다.

- 작업 내용:
  - `products/[productId]/page.tsx`에서 초기 상품 상세를 서버 fetch한다.
  - 최근 본 상품 저장 등 browser side effect만 client component로 분리한다.
  - not-found/error 처리 기준을 정리한다.

- 관련 파일/영역:
  - `src/app/(consumer)/products/[productId]/page.tsx`
  - `src/hooks/products/useProduct.ts`
  - `src/api/products/productApi.ts`

- 예상 난이도:
  중간

- 완료 기준:
  - 상품 상세 핵심 정보가 서버 HTML에 포함된다.
  - client side effect가 별도 컴포넌트로 분리된다.
