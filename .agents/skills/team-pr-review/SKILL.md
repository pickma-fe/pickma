---
name: team-pr-review
description: 동료의 PickMa PR을 리뷰하고 temp/pr-N-team-review.md에 GitHub 댓글용 한국어 리뷰 문서를 작성한다. 팀원이 이 PR에서 고칠 항목과 리뷰어가 후속으로 처리할 API/hook/story/test 작업을 분리한다.
---

# 팀 PR 리뷰

동료 PR을 리뷰할 때 사용한다. 목적은 공정하고 실행 가능한 GitHub 코멘트를 만드는 것이다. 리뷰어가 나중에 맡을 인접 작업을 팀원의 blocker로 만들지 않는다.

사용자가 "PR 35 리뷰"처럼 PR 번호만 말하면 다음 경로로 해석한다.

- Output: `temp/pr-N-team-review.md`

기존 리뷰 파일이 있으면 유효한 scope, follow-up, verification 맥락은 보존하고 오래된 finding은 현재 리뷰 결과로 교체한다.

## 작업 흐름

1. PR scope, 작성자 의도, 변경 파일, base/head branch를 확인한다.
2. 변경 영역에 맞는 지침만 읽는다.
   - 항상: `.codex/instructions/coding-style.md`, `.codex/instructions/implementation.md`
   - API/Domain: `docs/system_architecture.md`, `docs/type_architecture.md`, `docs/domain.md`, `docs/api_spec.md`
   - UI/flow: `docs/prd.md`, 필요 시 `docs/ia.md`
3. finding을 세 가지로 분리한다.
   - `Team Comments`: 팀원이 이 PR에서 조치할 수 있는 항목
   - `Clarifying Questions`: 의도, UX, scope 확인 질문
   - `Reviewer Follow-up Notes`: 리뷰어가 나중에 처리할 후속 작업
4. 리뷰 결과를 한국어로 `temp/pr-N-team-review.md`에 작성하거나 갱신한다.
5. GitHub에 붙일 수 있게 짧고 구체적으로 작성한다.
6. blocker 표현은 팀원 PR scope 안의 실제 결함, 깨진 기능, 보안/계약 위반에만 사용한다.
7. 검증 결과를 기록하고, 실패가 PR scope 밖이면 그렇게 표시한다.

## 리뷰 기준

### Scope 공정성

- API/hook 연동이 리뷰어 후속 작업이면 팀원에게 API-ready 구조를 blocker로 요구하지 않는다.
- 임시 mock UI는 범위가 명확하면 허용한다. 제거가 잊힐 위험이 있으면 TODO나 follow-up 기록을 요청한다.
- UI label이 `보기`, `저장`, `승인`처럼 동작을 약속하면 실제 interaction과 맞는지 확인한다.
- 의도나 copy가 애매하면 단정형 지적보다 질문으로 남긴다.

### Frontend PR

- 컴포넌트에서 Supabase/API client를 직접 호출하지 않는가.
- loading/error/empty/disabled/pending 상태가 필요한 흐름에 있는가.
- 한국어 UI copy가 실제 구현된 동작과 일치하는가.
- semantic/accessibility 기준이 크게 깨지지 않는가.
- 시각 상태와 기본 interaction은 Storybook 기준으로 다룰 수 있는가.
- Vitest 컴포넌트 테스트를 요구해야 하는 경우는 `create-test` 기준에 해당하는가.

### Backend/API PR

- `src/api` -> `/api/*` Route Handler -> Supabase 흐름을 지키는가.
- Contract DTO와 Domain type 경계가 맞는가.
- response envelope, HTTP status/body `statusCode`, `AppError`, Zod validation error가 맞는가.
- Route Handler helper가 `src/app/api/{resource}/_lib/{service,mapper,schemas}.ts` 구조를 따르는가.
- auth, authorization, ownership 검증이 PR scope 안에서 필요한 만큼 있는가.

## 출력 형식

`temp/pr-N-team-review.md`를 다음 형식으로 작성한다.

```markdown
# PR <number> 팀 리뷰

## 범위

- PR scope:
- 리뷰어 담당 follow-up:

## 팀 코멘트

### 필수 수정

- [path:line](path#Lline)
  - 문제:
  - 영향:
  - 제안:

### 확인 질문

- [path:line](path#Lline)
  - 질문:

### 개선 제안

- [path:line](path#Lline)
  - 제안:

## 리뷰어 후속 메모

- 팀원에게 요청하지 않을 후속 작업:

## 검증

- 명령:
- 결과:
```

문제가 없으면 `Team Comments`에 blocker가 없다고 명확히 말하고, 남은 follow-up과 검증 리스크만 짧게 적는다.

최종 대화 응답은 짧게 작성한다: 리뷰 파일 경로와 `Must Fix`/`Confirm`/`Improvements` 개수, 남은 검증 리스크만 요약한다.
