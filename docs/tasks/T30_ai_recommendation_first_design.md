# T30. AI 추천 1차 설계

- 상태:
  완료

- GitHub Issue:
  276

- 우선순위:
  P3

- 선행 조건:
  - 선행 task: T25. hook input Domain/UI 타입 분리, T05. 상품 목록 할인율 필터/정렬 DB pagination 복구

- 분류:
  기능

- 사용자 흐름:
  Customer

- 주 담당 역할:
  Domain

- 보조 역할:
  Customer-FE, Architecture

- 배경:
  심화 프로젝트에 AI 추천이 포함되어 있으나 추천 데이터, API, UI 경계가 아직 없다. 메인페이지 정렬 옵션에서 `AI 추천`을 제공할 가능성이 높고, 비로그인 사용자는 인기순 fallback이 필요하다.

- 문제:
  추천 필터를 기존 Contract query params에 직접 붙이면 검색/개인화 요구가 API DTO와 UI state를 오염시킬 수 있다. 또한 로그인 사용자 전용 개인화 정렬, 비로그인 fallback, 조회 이력 수집 기준이 정리되지 않으면 구현 시 추천 품질과 개인정보 사용 범위가 흔들릴 수 있다.

- 작업 내용:
  - `AI 추천`을 로그인 사용자 전용 개인화 정렬로 둘지와 비로그인 시 인기순 fallback 정책을 정한다.
  - 추천 입력 데이터 범위와 개인정보 사용 기준을 정한다.
  - 조회 이력은 상품 상세 진입 기준으로 수집하는 정책을 정한다.
  - 추천 API contract와 UI view model을 분리한다.
  - 주문 이력, 조회 이력, 거리, 할인율, 마감임박 기반의 1차 점수화 규칙을 정의한다.
  - fallback 추천 로직과 실패 시 UX를 정의한다.

- 관련 파일/영역:
  - `src/app/api/products/*`
  - `src/hooks/products/*`
  - `src/contracts/product.ts`
  - `docs/system_architecture.md`

- 예상 난이도:
  높음

- 완료 기준:
  - AI 추천의 데이터 입력/출력/실패 처리 정책과 개인정보 사용 기준이 문서화된다.
  - 로그인 사용자 전용 개인화 정렬과 비로그인 인기순 fallback 정책이 정리된다.
  - 상품 상세 진입 기준 조회 이력과 1차 점수화 규칙이 정리된다.
  - 1차 구현 범위가 API/UI/이벤트 수집 단위로 분해된다.
