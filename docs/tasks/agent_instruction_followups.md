# Agent Instruction Follow-ups

완료 task의 구현 결과를 기준으로 Codex, Claude, CodeRabbit 지침에 반영할 후보를 모아 둔다. 이 문서는 후보 목록이며, 실제 지침 파일 수정은 항목별 검토 후 별도 작업으로 진행한다.

## 반영 후보

| 출처 task     | 반영 대상                                                                                      | 필요도 | 제안 요약                                                                                                                                                                         |
| ------------- | ---------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T01           | `.coderabbit.yaml`, `.codex/instructions/implementation.md`, `.claude/rules/implementation.md` | 중     | 결제 confirm 변경 시 Toss 결제 성공 후 내부 RPC 실패 보상 정책(현재 Option B: Toss 자동 취소 + 주문 상태 복구)을 반드시 확인하도록 명시한다.                                      |
| T05, T08      | `.coderabbit.yaml`, `.codex/instructions/coding-style.md`, `.claude/rules/coding-style.md`     | 높음   | 스키마 변경 task는 `docs/migration_policy.md`를 읽고 incremental migration을 기본으로 작성한다는 점을 migration path 검토 기준에 추가한다.                                        |
| T05           | `.coderabbit.yaml`                                                                             | 중     | 상품 목록 필터/정렬 변경 시 `discount_rate`, `available_stock`, `original_price` DB 컬럼 기반 pagination을 유지하고, 전체 조회 후 메모리 pagination이 되살아나지 않는지 검토한다. |
| T06, T40, T41 | `.coderabbit.yaml`, `AGENTS.md`                                                                | 중     | Storage orphan cleanup은 client best-effort와 서버 cleanup을 분리하고, 민감 bucket 삭제는 service role + 소유권 검증을 요구한다는 기준을 명시한다.                                |
| T07           | `.coderabbit.yaml`                                                                             | 높음   | service role 사용 route는 `requireAdmin`, `requireSellerStore`, `requireActiveUser` 등 auth helper와 owner/store/admin scope 테스트가 함께 있는지 검토한다.                       |
| T24           | `.coderabbit.yaml`                                                                             | 낮음   | CI workflow 변경 시 lint, typecheck, test 기본 job과 mock/test placeholder env 유지 여부, E2E job은 T23 이후 분리한다는 기준을 추가한다.                                          |
| T27           | `.coderabbit.yaml`, `.codex/instructions/implementation.md`, `.claude/rules/implementation.md` | 높음   | Auth email/password 흐름은 선인증 OTP(`requestEmailVerification` → `verifyEmailOtp` → `completeEmailSignup`)와 Resend/Upstash 기반을 기준으로 검토한다.                           |
| T42, T44, T61 | `.coderabbit.yaml`, `AGENTS.md`                                                                | 높음   | 판매자 신청 서류는 사업자등록증, 영업신고증, 통장사본 3종으로 한정하고 신분증(`id_card`) 수집을 되살리지 않도록 검토 기준을 추가한다.                                             |
| T50, T52, T55 | `.coderabbit.yaml`                                                                             | 낮음   | 화면 task 완료 시 `docs/ia.md` 구현 상태와 `docs/tasks/*` 구현 결과가 함께 갱신됐는지 확인하는 docs 검토 기준을 추가한다.                                                         |

## 적용 메모

- CodeRabbit에는 path별 검토 기준으로 넣는 것이 가장 효과적이다.
  - `src/app/api/**`: T01, T07, T27, T40/T41
  - `src/app/(seller)/**`: T42/T44/T61, T50/T52
  - `src/app/(consumer)/**`: T55
  - `supabase/migrations/**`: T05/T08
  - `.github/workflows/**`: T24
  - `docs/**`: IA와 task 구현 결과 동기화
- Codex/Claude에는 너무 세부적인 완료 결과를 전부 복사하기보다, “작업 전 확인해야 할 기준 문서”와 “되살리면 안 되는 결정” 중심으로 짧게 반영하는 편이 좋다.
- 반영 우선순위는 개인정보/인증/권한(T07, T27, T42/T44/T61) → DB pagination/migration(T05/T08) → 결제 보상(T01) → 문서 동기화(T50/T52/T55) 순서를 권장한다.
