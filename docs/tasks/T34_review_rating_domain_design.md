# T34. 리뷰/평점 도메인 설계

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P5

- 선행 조건:
  - 선행 task: 없음
  - 기타 조건: 주문 완료 플로우 안정화

- 분류:
  기능

- 사용자 흐름:
  Customer / Seller

- 주 담당 역할:
  Domain

- 보조 역할:
  Customer-FE, Seller-FE

- 배경:
  seller sidebar에 reviews 링크가 있으나 실제 페이지와 도메인은 없다.

- 문제:
  미구현 링크가 사용자 혼란을 줄 수 있고, 장기적으로 신뢰/추천 품질을 위한 리뷰 데이터가 필요하다.

- 작업 내용:
  - 리뷰 작성 가능 상태를 주문 완료 기준으로 정의한다.
  - reviews schema, contract, mapper, API 범위를 설계한다.
  - seller review management와 customer review UI를 분리한다.
  - 미구현 기간에는 sidebar 링크 숨김 또는 준비 상태 처리 기준을 정한다.

- 관련 파일/영역:
  - `src/app/(seller)/seller/_components/sellerSidebarSections.ts`
  - `docs/erd.md`
  - `docs/domain.md`

- 예상 난이도:
  중간

- 완료 기준:
  - 리뷰/평점 도메인 설계 초안이 있다.
  - 미구현 링크 노출 정책이 정리된다.
