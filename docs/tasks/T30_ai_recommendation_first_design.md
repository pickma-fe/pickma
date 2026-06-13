# T30. AI 추천 1차 설계

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

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
  심화 프로젝트에 AI 추천이 포함되어 있으나 추천 데이터, API, UI 경계가 아직 없다.

- 문제:
  추천 필터를 기존 Contract query params에 직접 붙이면 검색/개인화 요구가 API DTO와 UI state를 오염시킬 수 있다.

- 작업 내용:
  - 추천 입력 데이터 범위와 개인정보 사용 기준을 정한다.
  - 추천 API contract와 UI view model을 분리한다.
  - fallback 추천 로직과 실패 시 UX를 정의한다.

- 관련 파일/영역:
  - `src/app/api/products/*`
  - `src/hooks/products/*`
  - `src/contracts/product.ts`
  - `docs/system_architecture.md`

- 예상 난이도:
  높음

- 완료 기준:
  - AI 추천의 데이터 입력/출력/실패 처리 정책이 문서화된다.
  - 1차 구현 범위가 API/UI 단위로 분해된다.
