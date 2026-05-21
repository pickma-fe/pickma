---
paths:
  - '**/*'
---

# 커밋 규칙

Conventional Commits 형식.

<type>: <subject>

- subject: 50자 이내, 마침표 없음
- subject는 한국어로 작성
- body 없이 subject에 압축
- 하나의 subject로 표현 가능한 단위로 커밋

## Type 목록

| Type       | 설명                      |
| :--------- | :------------------------ |
| `feat`     | 새로운 기능               |
| `fix`      | 버그 수정                 |
| `docs`     | 문서 변경                 |
| `style`    | 코드 포맷팅 (기능 변화 X) |
| `refactor` | 리팩토링                  |
| `test`     | 테스트 추가/수정          |
| `chore`    | 빌드, 설정 변경           |
| `revert`   | 커밋 되돌리기             |

## 예시

feat: 소셜 로그인 추가
fix: 결제 콜백 오류 수정 (#12)
docs: README 업데이트
refactor: 인증 로직 훅 분리
chore: ESLint 설정 추가
revert: feat: 소셜 로그인 추가

## 금지 사항

- ❌ 마침표로 끝나는 subject
- ❌ 50자 초과 subject
- ❌ 여러 작업을 하나의 커밋에 포함
- ❌ `temp/` 파일, 로컬 작업 메모, 체크포인트, 리뷰 초안을 커밋/푸시
- ❌ ignored 파일(`temp/*`, `AGENTS.override.md`, `CLAUDE.local.md`, `.claude/settings.local.json`, IDE 설정)을 강제 추가
