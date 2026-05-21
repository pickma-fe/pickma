# 커밋 규칙

Conventional Commits 형식을 사용한다.

```text
<type>: <subject>
```

규칙:

- 가능하면 subject는 50자 이내로 작성한다.
- subject는 한국어로 작성한다.
- subject 끝에 마침표를 붙이지 않는다.
- 요청받지 않으면 body를 추가하지 않는다.
- 하나의 commit은 하나의 응집된 작업 단위로 유지한다.

## Type 목록

| Type       | 의미                        |
| ---------- | --------------------------- |
| `feat`     | 새 기능                     |
| `fix`      | 버그 수정                   |
| `docs`     | 문서 변경                   |
| `style`    | formatting 변경만 포함      |
| `refactor` | behavior 변경 없는 refactor |
| `test`     | test 추가 또는 수정         |
| `chore`    | build 또는 설정 변경        |
| `revert`   | commit 되돌리기             |

## 예시

```text
feat: 소셜 로그인 추가
fix: 결제 콜백 오류 수정 (#12)
docs: README 업데이트
refactor: 인증 로직 훅 분리
chore: ESLint 설정 추가
revert: feat: 소셜 로그인 추가
```

## 금지 사항

- `temp/` 파일, 로컬 작업 메모, 체크포인트, 리뷰 초안은 commit/push하지 않는다.
- ignored 파일(`temp/*`, `AGENTS.override.md`, `CLAUDE.local.md`, `.claude/settings.local.json`, IDE 설정)을 강제 추가하지 않는다.
