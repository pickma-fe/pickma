---
name: create-issue
description: PickMa docs/tasks의 task ID를 기준으로 GitHub issue template을 선택하고 temp/Txx-issue.md에 이슈 초안을 작성한다.
argument-hint: 'task ID'
---

# 이슈 초안 생성

PickMa task에서 GitHub Issue 초안을 만들 때 사용한다. 사용자가 "T02 이슈", "T02 issue 만들어줘"처럼 task ID를 주면 `docs/tasks/T02_*.md`를 원본 task로 읽고 `temp/T02-issue.md`를 생성 대상으로 해석한다.

이 스킬은 temp 이슈 초안만 생성한다. GitHub Issue를 직접 만들지 않고, task 문서의 `GitHub Issue` 번호도 갱신하지 않는다.

## 작업 흐름

1. task ID를 파악한다. task ID가 없고 후보가 여러 개면 사용자에게 확인한다.
2. `docs/tasks/README.md`와 `docs/tasks/Txx_*.md`를 읽어 제목, 우선순위, 상태, GitHub Issue 값, 분류, 사용자 흐름, 역할, 배경, 문제, 작업 내용, 관련 파일, 완료 기준을 확인한다.
3. `.github/ISSUE_TEMPLATE/*.md`를 읽고 task 성격에 가장 맞는 template을 하나 선택한다.
4. 생성 대상은 `temp/Txx-issue.md`로 둔다. 이미 있으면 덮어쓰기 전에 사용자에게 확인한다.
5. 선택한 issue template의 frontmatter와 섹션 구조를 유지하되, task 문서에서 확인한 내용으로 본문을 채운다.
6. 초안 앞부분에 선택 근거와 원본 task 경로를 짧게 남긴다. GitHub에 붙여 넣을 본문은 `## GitHub Issue Draft` 아래에 둔다.
7. 최종 응답에서는 생성된 파일, 선택한 template, 실제 issue 생성 후 task 문서의 `GitHub Issue` 번호를 갱신해야 한다는 점만 간단히 알린다.

## Template 선택 기준

- `feature.md`: 새 사용자 기능, 화면, API endpoint, hook, user flow 구현이 중심인 task.
- `bug.md`: 이미 동작해야 하는 기능의 깨짐, 회귀, 재현 가능한 오류 수정이 중심인 task.
- `refactor.md`: public behavior 변경 없이 코드 구조, 타입, import, 호출 방식, 계층 구조를 개선하는 task.
- `docs.md`: 정책, 설계, 기준 문서 작성/수정이 중심이고 code 변경이 없거나 보조적인 task.
- `chore.md`: CI, 설정, tooling, repository 구조, 자산 정리, 개발 환경 정비처럼 기능/문서/리팩터링 중 하나로 보기 애매한 task.

선택이 애매하면 task의 `분류`, `작업 내용`, `완료 기준`을 우선한다. 예를 들어 "정책 확정"과 문서화가 핵심이면 `docs.md`, 정책에 맞춘 구현이 핵심이면 `feature.md` 또는 `chore.md`를 고른다.

## 초안 형식

```markdown
# Txx GitHub Issue Draft — {task 제목}

- Task 문서: `docs/tasks/Txx_*.md`
- 선택한 template: `.github/ISSUE_TEMPLATE/{template}.md`
- 선택 근거: {짧은 이유}
- GitHub Issue: 확인 필요 또는 `#N`

## GitHub Issue Draft

{선택한 template frontmatter와 본문}
```

## 작성 규칙

- title frontmatter는 template prefix를 유지하고 task 제목을 붙인다. 예: `title: '[feat] 판매자 주문 관리 real API 연결'`
- labels frontmatter는 template 값을 유지한다.
- `Task ID:`에는 task ID만 쓴다.
- 체크박스는 task의 `작업 내용`을 실행 가능한 항목으로 바꿔 작성한다.
- `작업 위치`, `리팩토링 대상`, `발생 위치`, `참고` 등 template별 섹션에는 task의 관련 파일/영역과 문서 경로를 넣는다.
- task에 없는 내용을 추측해서 확정하지 않는다. 필요한 경우 본문에 `확인 필요:`로 남긴다.
- `temp/` 파일은 commit 대상에 포함하지 않는다.
