# T33. 네이티브 앱 결제 방식 재검토

- 상태:
  완료

- GitHub Issue:
  281

- 우선순위:
  P3

- 선행 조건:
  - 선행 task: T01. 결제 confirm 보상 정책 확정

- 분류:
  아키텍처

- 사용자 흐름:
  Customer

- 주 담당 역할:
  Architecture

- 보조 역할:
  Customer-FE, Domain

- 배경:
  장기적으로 Capacitor 네이티브 앱을 고려할 수 있으나 현재 결제는 `window.open` 팝업 방식이다.

- 문제:
  앱 웹뷰에서는 팝업 결제 방식이 안정적으로 동작하지 않을 수 있다.

- 작업 내용:
  - 인앱 웹뷰, 외부 브라우저, 딥링크 기반 결제 옵션을 비교한다.
  - Toss 모바일 결제 권장 플로우를 확인한다.
  - 현재 web 결제 구조와 분리 가능한 adapter 경계를 정한다.

- 관련 파일/영역:
  - `src/hooks/payments/usePayment.ts`
  - `src/app/api/payments/*`
  - `docs/system_architecture.md`

- 예상 난이도:
  중간

- 완료 기준:
  - 네이티브 앱 전환 시 결제 변경 범위가 문서화된다.
  - web 결제 adapter와 mobile 결제 adapter 분리 방향이 정해진다.
