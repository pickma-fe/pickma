# Task Dependency Review

미완료 task(`진행 전`, `진행 중`)의 직접 선행 task를 검토한 결과다. 직접 선행 task는 “해당 task를 안전하게 시작하기 전에 결정 또는 구현이 완료되어야 하는 작업”만 기록한다.

## 변경한 의존성

| Task | 변경                                             | 근거                                                                                                                                           |
| ---- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| T03  | `없음` → `T07`                                   | 관리자 승인 화면은 이미 구현된 admin seller API/hook을 사용하지만, 승인/거절/문서 read URL은 admin 권한과 owner scope 검증 기준을 전제로 한다. |
| T16  | `T07` → `T07, T61`                               | upload URL purpose 중 `seller_application_document`는 T61의 3종 서류 타입 정리 이후 정책을 확정해야 `id_card` 기준이 되살아나지 않는다.        |
| T23  | `T02, T03, T04, T01` → `T01, T02, T03, T04, T24` | E2E 전략은 결제/판매자/관리자 핵심 흐름과 CI 기반을 전제로 하므로 T24 기본 파이프라인을 직접 선행으로 추가한다.                                |
| T43  | `없음` → `T24`                                   | Vercel 배포와 Cron 환경 기준은 GitHub Actions 기본 CI와 env 운영 기준 이후에 정리하는 것이 안전하다.                                           |
| T51  | `T10` → `T10, T15`                               | seller dashboard는 운영 상태 정책과 서버 상태 조회 hook/query key 기준을 함께 전제로 한다.                                                     |
| T53  | `T15` → `T15, T16`                               | 가게 정보 수정 화면은 이미지 업로드를 포함하므로 purpose별 upload URL 권한 정책을 먼저 확정해야 한다.                                          |
| T59  | `없음` → `T15`                                   | wishlist API/page는 신규 server state hook과 mutation invalidation을 포함하므로 query key factory 이후 구현한다.                               |

## 유지한 주요 의존성

- T04 → T07: admin store real endpoint는 service role/owner scope 기준 이후 구현.
- T10 → T08: 운영 상태 schema 변경은 incremental migration 정책 이후 구현.
- T11 → T01: outbox/webhook/idempotency는 결제 보상 정책 이후 설계.
- T12 → T05, T56 → T05/T12: 공개 상품 목록과 검색은 DB pagination 복구 이후 확장.
- T14 → T07: role-aware guard는 service role/owner scope 기준 이후 정리.
- T15 → T02: 기존 판매자 주문 real API 연결 흐름을 기준으로 query key/invalidation factory 도입.
- T29/T36/T42 → T44/T61: 판매자 서류 UX와 법적 동의 흐름은 신분증 수집 폐지와 3종 서류 기준 정리 이후 진행.
- T41 → T40/T43: 주기적 scanner는 cleanup API/hook과 Vercel Cron 환경 이후 구현.
- T45 → T09, T46/T47/T48/T49 → T45: 접근성 개선은 baseline과 노출 인벤토리 이후 사용자 흐름별로 진행.

## 현재 차단 상태

- P0 중 즉시 착수 가능: T09.
- P0 중 T07 완료로 착수 가능: T03, T04.
- 진행 중: T12, T13.
- P1 중 T61 완료 전 차단: T16, T42.
- T15 완료 전 차단: T51, T53, T54, T59.
- P2/P3 중 상위 정책 또는 기반 task 대기: T21, T22, T23, T25, T26, T28, T29, T30, T31, T32, T36, T38, T41, T46, T47, T48, T49, T56, T57.
