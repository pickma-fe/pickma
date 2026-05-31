# 구현 규칙

적용 범위:

- `src/**/*`

## 기본 원칙

- 요청받은 범위만 구현한다.
- 기존 code style을 따른다.
- 관련 파일만 수정한다.
- 임의의 구조 변경을 피한다.
- 요청된 동작이 실제로 모호하거나 위험하면 먼저 질문한다.

## 새 파일

- 새 파일은 기존 folder convention에 맞춰 배치한다.
- component는 `src/components/` 아래의 기존 category folder를 우선 사용한다.
- API/Domain 작업은 `docs/system_architecture.md`, `docs/domain.md`, `docs/api_spec.md`를 따른다.
- 결제 confirm/취소 흐름 변경 전에는 T01 보상 정책과 `docs/system_architecture.md`, `docs/api_spec.md`의 결제 명세를 확인한다.
- Auth email/password 흐름 변경 전에는 T27 선인증 정책과 `docs/system_architecture.md`, `docs/api_spec.md`의 auth 명세를 확인한다.
- 명시적 요청, 현재 설계 문서, 또는 명확한 필요가 없으면 package를 추가하지 않는다.

## 피해야 할 작업

- 요청받지 않은 refactor
- 임의의 package 추가
- 무관한 behavior 변경
- 넓은 범위의 formatting churn

## Build 검증

- 변경 범위에 맞는 검증을 선택한다.
- 환경이 지원하면 targeted test, `npm run test`, `npm run lint`, TypeScript check, build 검증을 적절히 사용한다.
- 로컬 전용 명령 제한은 공유 프로젝트 지침이 아니라 gitignored 로컬 지침 파일에 둔다.

## 응답 방식

구현 작업을 요약할 때는 변경 파일을 먼저 말하고, 그 다음 검증 내용을 말한다.
