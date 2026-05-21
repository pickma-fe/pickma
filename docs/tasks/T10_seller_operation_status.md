# T10. 판매자 운영 상태 정책 및 구현

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P1

- 선행 조건:
  - 선행 task: T08. incremental migration 전환 결정

- 분류:
  기능

- 사용자 흐름:
  Seller / Customer

- 주 담당 역할:
  Domain

- 보조 역할:
  Seller-FE, Customer-FE, Architecture

- 배경:
  현재 `StoreStatus`는 관리자 승인 상태이고 판매자가 당일 휴무나 주문 일시 중지를 제어할 필드가 없다.

- 문제:
  판매자가 주문 접수를 멈추려면 상품을 모두 닫거나 관리자에게 요청해야 한다.

- 작업 내용:
  - `isOpen` 또는 `operationStatus` 필드 정책을 결정한다.
  - stores schema, contract, domain type, mapper를 수정한다.
  - `PATCH /api/stores/me` 또는 별도 endpoint로 판매자 상태 변경을 지원한다.
  - 상품 목록/상세/주문 생성에서 운영 중지 상태를 검증한다.
  - 판매자 가게 정보 UI에 토글/상태 표시를 추가한다.

- 관련 파일/영역:
  - `src/types/store.ts`
  - `src/contracts/store.ts`
  - `src/app/api/stores/me/*`
  - `src/app/(seller)/seller/store/*`
  - `src/app/api/orders/_lib/service.ts`
  - `src/app/api/products/_lib/service.ts`

- 예상 난이도:
  높음

- 완료 기준:
  - 관리자 승인 상태와 판매자 운영 상태가 분리된다.
  - 판매자가 UI에서 운영 상태를 변경할 수 있다.
  - 운영 중지 가게의 상품 주문 생성이 막힌다.
  - 관련 문서와 테스트가 갱신된다.
