---
name: code-review
description: PickMa task 구현을 백엔드, 프론트엔드, 공통 코드 관점에서 리뷰하고 temp/Txx-code-review.md에 한국어 리뷰 문서를 작성한다.
argument-hint: 'task ID 또는 파일 경로'
---

# 코드 리뷰

PickMa task 구현, PR 전 변경사항, 특정 파일을 리뷰할 때 사용한다. 사용자가 "T02 리뷰"처럼 task ID만 말하면 `docs/tasks/T02_*.md`, `temp/T02-plan.md`, `temp/T02-code-review.md` 기준으로 해석한다.

## 리뷰 흐름

1. task ID를 확인하고 `docs/tasks/Txx_*.md`와 `temp/Txx-plan.md`를 읽는다. 계획 파일이 없으면 task 문서만 기준으로 진행한다.
2. 변경 범위를 파악한다. 필요하면 `git diff`, `git diff --staged`, 관련 파일을 확인한다.
3. 관련 지침만 읽는다.
   - 항상: `.codex/instructions/coding-style.md`, `.codex/instructions/implementation.md`
   - 아키텍처/상태/API 경계: `docs/system_architecture.md`, `docs/type_architecture.md`
   - Domain type: `docs/domain.md`
   - API/validation/error/status/pagination: `docs/api_spec.md`
   - 사용자 흐름/역할별 UI: `docs/prd.md`
4. 변경 영역을 분류한다: `frontend`, `backend-api`, `shared-domain`, `tests`, `docs`.
5. 리뷰 결과를 한국어로 `temp/Txx-code-review.md`에 작성하거나 갱신한다.

## 항상 확인할 항목

- 요청 task scope와 실제 변경 범위가 맞는가.
- import 방향을 지키는가: `types/contracts -> lib -> api -> stores -> hooks -> components -> app`.
- `any`, 불명확한 타입, 누락된 return type, Props interface 문제가 없는가.
- 민감 정보, auth/session 세부사항, service-role 동작이 client/UI/error에 노출되지 않는가.
- 사용자에게 보이는 loading/error/empty/disabled 상태가 필요한 곳에 있는가.
- 변경 위험에 맞는 test, story, lint, manual verification이 있는가.
- 불필요한 리팩터링, broad formatting churn, 임의 패키지 추가가 없는가.

## 영역별 확인

- Frontend: Domain type 사용, TanStack Query/Zustand 역할 분리, form validation, 접근성, App Router 경계, 한국어 copy, 반응형 layout, Storybook 필요 여부.
- Backend/API: `src/api` -> `/api/*` Route Handler -> Supabase 흐름, auth wrapper, cookie session, 권한/소유권 검증, API envelope/error code/Zod 변환, 501 처리, `_lib` 구조.
- Shared Domain: DTO는 `src/contracts`, Domain type은 `src/types`, ISO date/Date 경계, server/client mapper 경계, API request DTO와 화면 state 분리.

## 보고서 형식

`temp/Txx-code-review.md`를 다음 형식으로 작성한다. 기존 파일이 있으면 유효한 맥락은 보존하고 오래된 finding은 교체한다.

```markdown
# Txx 코드 리뷰

## 리뷰 범위

- 리뷰한 task: `docs/tasks/Txx_*.md`
- 리뷰한 계획: `temp/Txx-plan.md`
- 리뷰한 변경:
- 참고 문서:

## 필수 수정

- **[Severity: Required] [path:line](path#Lline)**
  - 문제: ...
  - 영향: ...
  - 제안: ...

## 권장 수정

- **[Severity: Improvements] [path:line](path#Lline)**
  - 문제: ...
  - 영향: ...
  - 제안: ...

## 있으면 좋은 개선

- **[Severity: Suggestions]**
  - 제안: ...

## 검증 메모

- 실행한 검증:
- 남은 검증 리스크:
```

Severity 기준:

- `Required`: 버그, 보안 위험, 아키텍처 위반, 깨진 contract, merge-blocking 누락.
- `Improvements`: 컨벤션 위반, 누락된 test/story, 접근성 gap, 유지보수 위험, edge case.
- `Suggestions`: 선택적 단순화나 더 나은 대안.

최종 대화 응답은 짧게 작성한다: 리뷰 파일 경로, `Required`/`Improvements` 개수, 남은 검증 리스크만 요약한다.
