# CLAUDE.md

PickMa의 Claude Code 프로젝트 지침이다. 이 파일은 Claude entry point로 유지하고, 아래에서 공유 agent 지침을 import한다.

## Import

@AGENTS.md

## 참조 범위

- `AGENTS.md`는 공유 PickMa agent 맥락과 아키텍처 규칙의 entry point다.
- `.claude/rules/*`는 Claude path-scoped rule이며, 각 rule의 scope에 따라 Claude Code가 로드한다.
- `.claude/skills/*`는 Claude 전용 skill이다.
- 이 파일은 간결한 Claude bridge로 유지하고, 중복된 프로젝트 규칙을 다시 정의하지 않는다.

## Claude 메모

- Claude Code는 `@path/to/file` 문법으로 파일을 import한다.
- Markdown code span 또는 code block 내부의 import는 평가되지 않는다.
