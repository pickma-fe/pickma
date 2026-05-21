---
name: create-plan
description: PickMa docs/tasks의 task를 기준으로 temp/Txx-plan.md 계획 문서를 생성한다. task 상태를 진행 중으로 갱신하고, 실행 가능한 작은 step과 검증 계획, GitHub issue 초안을 정리한다.
argument-hint: 'task ID와 계획할 작업 설명'
---

# 계획 생성

PickMa task 계획 문서를 만들 때 사용한다. 사용자가 "T02 계획"처럼 task ID를 주면 `docs/tasks/T02_*.md`를 원본 task로 읽고 `temp/T02-plan.md`를 생성 대상으로 해석한다.

이 스킬은 계획 문서와 task 상태만 생성/수정한다. production code는 수정하지 않는다.

## 작업 흐름

1. task ID와 작업 설명을 파악한다. task ID가 없고 후보가 여러 개면 사용자에게 확인한다.
2. `docs/tasks/README.md`와 `docs/tasks/Txx_*.md`를 읽어 목표, 범위, 우선순위, 선행 조건, 관련 파일을 확인한다.
3. 생성 대상은 `temp/Txx-plan.md`로 둔다. 이미 있으면 덮어쓰기 전에 사용자에게 확인한다.
4. task 문서와 `docs/tasks/README.md`의 해당 행 상태를 `진행 중`으로 갱신한다. 이미 다른 상태면 임의로 덮어쓰지 말고 사용자에게 확인한다.
5. GitHub Issue가 `확인 필요`이면 task 성격에 맞는 기존 issue template을 선택해 `temp/Txx-issue.md` 초안을 작성한다. 별도 create-issue 스킬은 두지 않는다. issue를 직접 만들지는 않고, 최종 응답에서 생성 필요와 task 문서의 issue 번호 갱신 필요를 알린다.
6. 작업 성격에 맞는 문서만 확인한다.
   - 항상: `CLAUDE.md`, `.claude/rules/coding-style.md`, `.claude/rules/implementation.md`
   - DB/API/Domain: `docs/system_architecture.md`, `docs/type_architecture.md`, `docs/domain.md`, `docs/api_spec.md`, 필요 시 `docs/erd.md`
   - 화면/사용자 흐름: `docs/prd.md`, 필요 시 `docs/ia.md`
7. 현재 코드 상태를 필요한 만큼 확인해 이미 완료된 작업, 존재하는 파일, 충돌 가능성을 반영한다.
8. task 범위를 커밋 가능한 작은 step으로 나눈다. 각 step에는 목적, 예상 변경 파일, 작업 내용, 검증, 커밋 기준을 포함한다.
9. `temp/Txx-plan.md`를 작성한다.

## 계획 형식

```markdown
# Txx 계획 — {제목}

## 목표

- 이 task가 완료해야 하는 결과

## 배경

- Task 문서: `docs/tasks/Txx_*.md`
- GitHub Issue: 확인 필요 또는 `#N`
- 현재 상태:
- 중요한 제약/결정:

## 범위

포함:

- ...

제외:

- ...

## 실행 단계

### 1단계. {작은 커밋 단위 제목}

- 목적:
- 예상 변경 파일:
- 작업 내용:
- 검증:
- 커밋 기준:

## 영향 파일

- 생성/수정 예상 파일
- DB/API/Domain 작업인 경우 수동 검증 경로

## 확인 필요 사항

- 미결정 사항 또는 사용자 확인이 필요한 blocker

## 검증 계획

- targeted test:
- lint/test/storybook:
- 수동 검증:

## 완료 기준

- 기능/계약/테스트/story/문서 기준

## 리뷰 산출물

- `temp/Txx-code-review.md`
```

## 규칙

- task 원본은 `docs/tasks/`에 두고, 계획 산출물은 반드시 `temp/` 아래에 둔다.
- task 기반 temp 파일명은 task ID를 맨 앞에 둔다.
- 계획은 `execute-plan`이 step별 승인/구현/검증/커밋을 할 수 있을 만큼 작고 명확해야 한다.
- 포함/제외 범위를 분명히 적고, 인접 task 작업을 섞지 않는다.
- 확인이 필요한 결정은 숨기지 말고 `확인 필요 사항`에 적는다.
- 테스트 작성 step은 `create-test`, story 작성 step은 `create-story`, 컴포넌트 작성 step은 `create-component` 기준과 충돌하지 않게 계획한다.
