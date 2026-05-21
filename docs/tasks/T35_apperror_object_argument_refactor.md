# T35. AppError 객체 인수 리팩터링

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P3

- 선행 조건:
  - 선행 task: 없음

- 분류:
  아키텍처

- 사용자 흐름:
  Shared

- 주 담당 역할:
  Architecture

- 보조 역할:
  Domain

- 배경:
  현재 `AppError` 생성자는 `new AppError(code, statusCode, message?, details?)` 위치 기반 인수를 사용한다.

- 문제:
  `details`만 전달해야 할 때 `undefined`를 끼워 넣어야 하며, 실수로 세 번째 인수에 details를 넣으면 message 자리에 들어가는 오류가 생길 수 있다.

- 작업 내용:
  - `AppError` 생성자를 객체 인수 기반으로 전환한다.
  - 기존 `new AppError(...)` 호출부를 전체 마이그레이션한다.
  - validation details 전달 테스트를 추가한다.
  - error envelope, status code, error code 정책은 변경하지 않는다.

- 관련 파일/영역:
  - `src/lib/errors/appError.ts` 확인 필요
  - `src/app/api/**/*`
  - `src/app/api/_lib/response.ts`
  - `src/app/api/_lib/validation.ts`

- 예상 난이도:
  중간

- 완료 기준:
  - AppError 호출부가 객체 인수로 통일된다.
  - `details` 전달 실수를 막는 타입 구조가 있다.
  - 기존 API error envelope 동작이 유지된다.
