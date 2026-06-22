# T67. i18n 기본 설정 (next-intl, 한국어)

- 상태:
  진행 전

- GitHub Issue:
  확인 필요

- 우선순위:
  P5

- 선행 조건:
  - 선행 task: T45. UI/UX 및 접근성 baseline 기준 수립

- 분류:
  기반

- 사용자 흐름:
  Shared

- 주 담당 역할:
  Shared-FE

- 보조 역할:
  Consumer-FE, QA

- 배경:
  T45에서 `lang="ko"` 설정을 완료했고, 접근성 baseline에서 텍스트 의미 전달 기준을 정했다. 현재 UI 문자열이 컴포넌트에 하드코딩되어 있어 향후 유지보수가 어렵다. 다국어 지원 계획은 없지만, 문자열을 `messages/ko.json`으로 분리해 두면 나중에 다국어 지원으로 확장하기 쉬운 구조를 만들 수 있다. 지금은 한국어 단일 언어로 좁게 설정한다.

- 문제:
  하드코딩된 한국어 문자열이 흩어져 있으면 문구 수정이 번거롭고 일관성을 유지하기 어렵다. `next-intl` 기반 구조로 정리하면 이후 다국어 확장 시 추가 리팩터링 비용을 줄일 수 있다.

- 작업 내용:
  - `next-intl`을 설치하고 Next.js App Router에 기본 설정을 한다.
  - 한국어(`ko`) 단일 locale로만 설정한다. URL locale prefix는 사용하지 않는다(non-prefixed routing 방식).
  - 주요 UI 문자열 카테고리를 정의하고 `messages/ko.json`으로 분리한다. 초기 분리 대상:
    - 공통 버튼·액션 레이블 (확인, 취소, 저장, 삭제 등)
    - 에러·빈 상태 메시지 (데이터 없음, 불러오기 실패 등)
    - 폼 validation 메시지
    - 기타 반복 문구
  - 분리된 문자열을 컴포넌트에서 `useTranslations` 훅으로 참조하도록 교체한다.
  - `next-intl` 미들웨어 설정이 기존 인증 미들웨어와 충돌하지 않는지 확인한다.
  - TypeScript 검사(`tsc --noEmit`)와 lint로 오류가 없음을 검증한다.

- 관련 파일/영역:
  - `messages/ko.json` (신규)
  - `src/i18n.ts` 또는 `src/i18n/request.ts` (신규)
  - `next.config.ts` (next-intl 플러그인 설정)
  - `src/middleware.ts` (locale 감지 미들웨어 — 기존 auth 미들웨어와 통합)
  - 문자열이 분리되는 컴포넌트 파일들

- 예상 난이도:
  중간

- 완료 기준:
  - `next-intl`이 설치되고 한국어 단일 locale로 기본 설정이 완료된다.
  - 주요 UI 문자열이 `messages/ko.json`으로 분리되고 컴포넌트가 `useTranslations`로 참조한다.
  - URL 구조 변경 없이 (non-prefixed) 기존 라우팅이 유지된다.
  - 기존 인증 미들웨어와 충돌 없이 동작한다.
  - TypeScript 검사와 lint가 통과한다.
  - 향후 언어 추가 시 `messages/{locale}.json` 파일만 추가하면 확장 가능한 구조가 된다.
