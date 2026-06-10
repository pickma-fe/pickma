# T21. 지도 기반 조회 및 거리순 정렬

- 상태:
  완료

- GitHub Issue:
  260

- 우선순위:
  P2

- 선행 조건:
  - 선행 task: T08. incremental migration 전환 결정, T05. 상품 목록 할인율 필터/정렬 DB pagination 복구

- 분류:
  기능

- 사용자 흐름:
  Customer

- 주 담당 역할:
  Customer-FE

- 보조 역할:
  Domain, Architecture

- 배경:
  심화 프로젝트의 지도 기능은 stores 위치 컬럼과 거리순 쿼리 전략을 필요로 한다.

- 문제:
  현재 stores에는 latitude/longitude 필드가 없고, 상품 목록도 거리순 정렬을 지원하지 않는다.

- 작업 내용:
  - stores 위치 컬럼 migration을 작성한다.
  - 주소-좌표 변환 입력 흐름을 가게 등록/수정에 연결한다.
  - 공개 상품 목록 API에 사용자 위치 기반 거리 계산/정렬을 추가한다.
  - 지도 UI와 목록 연동 상태를 구현한다.

- 관련 파일/영역:
  - `src/app/api/products/_lib/service.ts`
  - `src/app/api/stores/me/*`
  - `src/app/(consumer)/page.tsx`
  - `src/app/(seller)/seller/store/*`
  - `docs/erd.md`

- 예상 난이도:
  높음

- 완료 기준:
  - 가게 위치가 저장된다.
  - 고객이 지도/거리순으로 상품을 탐색할 수 있다.
  - 거리 계산이 API 서버 메모리 전체 정렬에 의존하지 않는다.
