---
name: restore-compact-context
description: temp/Txx-checkpoint.md 체크포인트 문서를 읽어 compact, 세션 전환, 작업 인계 이후 task 작업 상태를 복구하고 이어서 진행한다.
argument-hint: 'task ID 또는 [temp/Txx-checkpoint.md]'
---

# Checkpoint Context 복구

`temp/Txx-checkpoint.md` 또는 기존 checkpoint 문서를 읽어 task 작업 상태를 복구할 때 사용한다. checkpoint는 지도일 뿐이므로, 이어서 작업하기 전에 현재 workspace를 다시 확인한다.

## 파일 선택

- task ID가 주어지면 `temp/Txx-checkpoint.md`를 읽는다.
- 경로가 주어지면 그 파일을 읽는다.
- 경로가 없으면 `temp/T*-checkpoint.md`를 찾는다.
- 없으면 기존 호환을 위해 `temp/checkpoint-phase-*.md`, `temp/checkpoint-*.md`, `temp/compact-context-*.md` 순서로 찾는다.
- 후보가 하나면 사용한다.
- 후보가 여러 개면 가장 최근 수정 파일을 우선하되, 작업 주제와 맞지 않으면 사용자에게 선택을 요청한다.
- checkpoint가 없으면 `git status`, 열린 계획 문서, 최신 사용자 요청으로 재구성한다.

## 작업 흐름

1. checkpoint에서 사용자 목표, 현재 작업 상태, task/step/commit 상태, 중요한 결정, 파일 소유권, 검증 결과, 재개 지침, 미해결 질문을 추출한다.
2. `git status --short`와 checkpoint가 언급한 task/plan/review/source 파일을 다시 확인한다.
3. checkpoint와 workspace가 다르면 workspace를 우선하고 차이를 사용자에게 알린다.
4. open question이 blocker면 최소 질문만 한다. blocker가 아니면 기록된 다음 단계에서 이어간다.
5. 이어서 작업이 길어지면 checkpoint를 갱신할지 사용자에게 제안한다.

## 규칙

- checkpoint 내용만 믿고 파일을 덮어쓰지 않는다.
- 테스트 통과 여부는 기록된 결과를 확인하거나 필요하면 다시 실행한다.
- secret, env 값, credential은 노출하지 않는다.
- checkpoint에 특정 스킬이 언급되어 있고 현재 요청과 맞으면 그 스킬 기준을 따른다.
