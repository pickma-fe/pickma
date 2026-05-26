---
name: review-plan
description: PickMa temp/Txx-plan.md 계획 문서를 현재 문서, 코드, 실행 흐름 기준으로 검토하고, 수정 전 사용자 결정을 받는다.
argument-hint: 'task ID 또는 temp/Txx-plan.md 파일 경로'
---

# 계획 리뷰

PickMa task 계획을 실행 전에 검토하거나 보강할 때 사용한다. 사용자가 "T02 계획 검토"처럼 task ID만 말하면 `temp/T02-plan.md`로 해석한다.

이 스킬은 먼저 계획 문서를 검토해 항목별로 문제, 영향, 권장 조치를 설명한다. 사용자가 반영할 항목을 결정하기 전에는 계획 문서를 수정하지 않는다. production code는 수정하지 않는다.

## 작업 흐름

1. 대상 계획 문서를 읽는다. task ID만 있으면 `temp/Txx-plan.md`를 연다.
2. `docs/tasks/README.md`와 `docs/tasks/Txx_*.md`를 함께 읽어 task 목표, 선행 조건, scope, GitHub Issue를 확인한다.
3. 작업 성격에 맞는 문서만 확인한다.
   - 항상: `CLAUDE.md`, `.claude/rules/coding-style.md`, `.claude/rules/implementation.md`
   - DB/API/Domain: `docs/system_architecture.md`, `docs/type_architecture.md`, `docs/domain.md`, `docs/api_spec.md`, 필요 시 `docs/erd.md`
   - 화면/사용자 흐름: `docs/prd.md`, 필요 시 `docs/ia.md`
4. 현재 코드를 필요한 만큼 확인해 계획의 파일 경로, 이미 완료된 작업, 충돌 가능성, 누락된 의존성을 검증한다.
5. 수정하지 말고 검토 결과를 먼저 제시한다. 각 항목에는 현재 내용, 문제, 영향, 권장 조치, 반영 여부 선택지를 포함한다.
6. 사용자가 반영할 항목을 결정하면, 승인된 항목만 계획 파일에 수정한다.
7. 최종 응답에는 반영한 내용, 반영하지 않은 항목, 남은 질문, 실행 준비 여부를 짧게 요약한다.

## 계획 구조 확인

- 제목: `# Txx 계획 — {제목}`
- `목표`, `배경`, `범위`, `실행 단계`, `영향 파일`, `확인 필요 사항`, `검증 계획`, `완료 기준`, `리뷰 산출물`
- `리뷰 산출물`: `temp/Txx-code-review.md`

## 실행 가능성 확인

- `execute-plan`이 step별 승인/구현/검증/커밋을 할 수 있을 만큼 단계가 작고 명확한가.
- 각 step에 목적, 예상 변경 파일, 작업 내용, 검증, 커밋 기준이 있는가.
- 포함/제외 범위가 명확하고 인접 task 작업이 섞이지 않았는가.
- blocker와 비차단 확인 사항이 구분되는가.
- 검증 계획이 targeted test, lint/test/storybook, 수동 검증을 현실적으로 다루는가.

## 규칙

- 사용자 승인 전에는 어떤 파일도 수정하지 않는다.
- 승인 후에도 계획 파일 외에는 수정하지 않는다.
- 불확실한 scope를 조용히 제거하지 않는다. `확인 필요 사항` 또는 later task로 명시한다.
- 이미 완료된 작업은 현재 상태에 맞게 배경이나 제외 범위로 이동한다.
