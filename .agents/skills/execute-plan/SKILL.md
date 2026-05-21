---
name: execute-plan
description: PickMa temp/Txx-plan.md 계획을 확인한 뒤 실행 방안을 제시하고, 사용자 승인 후 커밋 가능한 작은 단위로 구현/검증/커밋을 반복한다. 완료 시 docs/tasks 상태를 갱신한다.
argument-hint: 'task ID 또는 temp/Txx-plan.md 파일 경로'
---

# 계획 실행

PickMa task 계획을 실제 코드 변경으로 실행할 때 사용한다. 사용자가 "T02 실행"처럼 task ID만 말하면 `docs/tasks/T02_*.md`와 `temp/T02-plan.md`를 기준으로 해석한다.

계획 문서 확인 후 실행 방안을 먼저 제시한다. 사용자가 승인하기 전에는 코드 변경을 시작하지 않는다.

## 작업 흐름

1. `docs/tasks/README.md`, `docs/tasks/Txx_*.md`, `temp/Txx-plan.md`를 읽고 포함/제외 범위, 단계, 확인 필요 사항을 파악한다.
2. task 문서의 GitHub Issue 번호가 있으면 issue 맥락을 함께 반영한다. `확인 필요`이면 실행 전 issue 생성 여부를 사용자에게 알린다.
3. `temp/Txx-code-review.md`가 있으면 Required/Improvements 중 아직 반영되지 않은 항목이 현재 task 범위에 포함되는지 확인한다.
4. 관련 지침만 읽는다.
   - 항상: `.codex/instructions/coding-style.md`, `.codex/instructions/implementation.md`
   - DB/API/Domain: `docs/system_architecture.md`, `docs/type_architecture.md`, `docs/domain.md`, `docs/api_spec.md`, 필요 시 `docs/erd.md`
   - 화면/사용자 흐름: `docs/prd.md`, 필요 시 `docs/ia.md`
5. 기존 코드와 dirty worktree를 확인한다. 사용자 변경을 덮어쓰지 않고, 패키지 추가 전 `package.json`을 확인한다.
6. 실행 방안을 작성해 사용자에게 확인받는다. 각 step마다 예상 변경 파일, 검증 방법, 커밋 기준, 예상 커밋 메시지 헤더를 적는다.
7. 승인된 step을 하나씩 실행하고, step 완료 후 관련 검증을 실행한다.
8. diff와 검증 결과를 요약해 사용자 검토를 받는다. 사용자가 통과시키면 해당 step만 미리 제시한 커밋 메시지 헤더로 커밋한다.
9. 모든 승인된 step이 끝나면 `temp/Txx-plan.md`의 체크박스/진행 결과를 갱신한다.
10. task 완료 전 관련 `docs/*` 최신화 필요 여부를 확인한다. 필요한 문서 수정은 같은 task 범위에서 반영하고, 범위를 넘으면 후속 task 또는 `확인 필요`로 남긴다.
11. task가 완료되면 `docs/tasks/Txx_*.md`와 `docs/tasks/README.md`의 상태를 `완료`로 갱신하고, task 문서에 구현 결과/검증 결과를 간결히 남긴다.
12. 계획/task 문서 갱신도 별도 커밋 가능한 변경이면 사용자 확인 후 커밋한다.
13. 최종 응답에는 생성한 커밋, 변경 파일, 검증 결과, 문서 갱신 여부, 건너뛴 항목, 다음 추천 task만 간결히 적는다.

## 실행 방안 형식

```markdown
## 실행 방안

1. Step title
   - 범위:
   - 예상 변경 파일:
   - 검증:
   - 커밋 기준:
   - 커밋 메시지 헤더:
```

## Scope 규칙

- 지정되지 않은 task는 실행하지 않는다.
- `확인 필요 사항`은 명확히 비차단 항목이 아니면 blocker로 본다.
- 사용자 승인 없이 구현, 검증 범위 확대, 커밋을 하지 않는다.
- API DTO는 `src/contracts`, Domain type은 `src/types`, client API/mapper는 `src/api`, Route Handler는 `src/app/api`, mock data는 `src/mocks`에 둔다.
- Route Handler helper는 `src/app/api/{resource}/_lib/{service,mapper,schemas}.ts` 구조를 따른다.
- task 원본 갱신은 `docs/tasks/`로 제한하고, 임시 산출물은 `temp/`에 둔다.
- 커밋 전에는 `.codex/instructions/commit.md`를 읽고 커밋 메시지 규칙을 따른다.
- 커밋 메시지는 헤더만 사용하고 본문은 작성하지 않는다.
