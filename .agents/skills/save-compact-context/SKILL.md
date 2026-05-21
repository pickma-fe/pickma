---
name: save-compact-context
description: 현재 task 작업 상태를 temp/Txx-checkpoint.md 문서로 저장해 compact, 세션 전환, 작업 인계, 장기 작업 재개에 사용할 수 있게 한다.
argument-hint: 'task ID 또는 [temp/Txx-checkpoint.md]'
---

# Checkpoint Context 저장

현재 task 작업 상태를 수동 체크포인트로 저장할 때 사용한다. 사용자가 요청했을 때만 `temp/` 아래에 복구 가능한 Markdown 문서를 생성하거나 갱신한다.

## 파일 선택

- task ID가 주어지면 `temp/Txx-checkpoint.md`를 사용한다.
- 경로가 주어지면 그 파일을 사용하되, 가능하면 `temp/Txx-checkpoint.md` 형식을 선호한다.
- task ID가 없으면 현재 작업 중인 `temp/Txx-plan.md`, `docs/tasks/Txx_*.md`, 대화 맥락에서 task를 추론한다.
- task를 안전하게 추론할 수 없고 phase 맥락만 있으면 기존 호환을 위해 `temp/checkpoint-phase-X.md`를 사용한다.
- 어떤 작업도 추론할 수 없으면 `temp/checkpoint-latest.md`를 사용한다.
- 같은 task에는 하나의 활성 checkpoint 파일만 유지한다.

## 작업 흐름

1. 최신 사용자 목표, 결정 사항, `git status --short`, 관련 task/plan/review 파일, 현재 step/승인/검증/커밋 상태를 확인한다.
2. secret, access token, service role key, API key, env 값은 기록하지 않는다.
3. checkpoint 문서를 작성하거나 갱신한다.
4. 오래된 다음 단계와 완료된 항목을 정리해, 다음 세션이 바로 이어갈 수 있게 만든다.

## Checkpoint 형식

```markdown
# Checkpoint: Txx — {Task Name}

## 마지막 업데이트

- Date/time:
- Agent:

## 사용자 목표

- ...

## 현재 작업 상태

- Completed:
- In progress:
- Not started:
- Blocked:

## Task / Step 상태

- Task 문서:
- Plan:
- Code review:
- GitHub Issue:
- Current step:
- Approved steps:
- Commits created:
- Next step:

## 중요 결정 사항

- ...

## 파일과 담당 범위

- Touched:
- Relevant but untouched:
- User-owned changes / do not overwrite:

## 검증

- Ran:
- Did not run:
- Still needed:

## 재개 지침

1. 이 파일을 읽는다.
2. 명시된 source/plan/review 파일을 읽는다.
3. `git status --short`를 확인한다.
4. 다음 위치부터 이어간다:

## 미해결 질문

- ...
```

## 규칙

- checkpoint 파일은 `temp/` 아래에 둔다.
- task 기반 checkpoint는 task ID를 파일명 맨 앞에 둔다.
- 테스트를 실행하지 않았다면 통과했다고 쓰지 않는다.
- checkpoint는 복구용 지도일 뿐이다. 복구 후에는 반드시 현재 파일과 git 상태를 다시 확인해야 한다.
