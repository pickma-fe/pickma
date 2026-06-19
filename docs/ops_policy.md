# PickMa 운영 정책

MVP 실서비스 기준 운영 절차와 정책을 정의한다.

---

## 1. CS 운영 절차

### 1.1 주문 취소/환불 문의

1. `GET /api/admin/orders?status=cancelled` 로 취소 주문 조회
2. 해당 주문의 `payment_events` 테이블에서 `event_type = 'payment_compensation_failed'` 조회
3. 보상 실패 이벤트가 있으면 `payload.failureStage` 확인 후 Toss 대시보드에서 결제 상태 직접 확인

| failureStage        | 상황                                        | 수동 조치                                             |
| ------------------- | ------------------------------------------- | ----------------------------------------------------- |
| `toss_cancel`       | Toss 취소 실패, 결제 승인 잔류              | Toss 대시보드에서 수동 취소/환불 후 DB 상태 수동 확인 |
| `revert_processing` | Toss 취소 성공, 주문 상태 `processing` 잔류 | DB `orders.status`를 `payment_pending`으로 복원       |
| `cancel_finalize`   | Toss 취소 성공, `cancel_order` RPC 실패     | DB `orders.status`를 `cancelled`로 수동 완료 처리     |

### 1.2 결제 미완료 주문 확인 (`processing` 잔류)

- `GET /api/admin/orders?status=processing` 으로 `processing` 잔류 주문 조회
- 30분 이상 잔류 주문은 `payment_events.event_type = 'payment_compensation_failed'` 조회
- 해당 이벤트 없으면 Toss 대시보드에서 결제 상태 확인 후 수동 처리

### 1.3 픽업 문의

1. 주문번호로 `orders` 테이블 조회
2. `orders.status` 확인 → `reserved`, `accepted`, `ready`, `completed`, `no_show` 등 현재 상태 파악
3. `orders.store_order_number`, `orders.pickup_number` 확인 후 소비자에게 안내

---

## 2. Admin 계정 관리 정책

### 2.1 계정 생성

- Supabase Dashboard → Authentication → Users 에서 사용자 확인
- `users` 테이블에서 해당 사용자의 `role` 필드를 `admin`으로 직접 변경
- 계정 생성 후 초기 비밀번호는 Supabase Auth 비밀번호 리셋 링크로 전달

### 2.2 계정 회수

1. `users` 테이블에서 해당 사용자의 `role` 필드를 `customer`로 변경
2. Supabase Dashboard → Authentication → Users → 해당 사용자 → "Sign out all sessions" 실행

### 2.3 계정 분실/비밀번호 리셋

- Supabase Dashboard → Authentication → Users → 해당 사용자 → "Send password reset email" 실행

### 2.4 Admin 권한 변경 감사

- 판매자 승인/거절 action은 구조화 로그(`ADMIN_APPROVE_SELLER_SUCCEEDED`, `ADMIN_REJECT_SELLER_SUCCEEDED`)로 기록됨
- Vercel Function Logs에서 `adminUserId`, `applicationId`로 검색하여 확인
- Admin 계정 role 변경은 현재 Supabase Dashboard 직접 변경만 허용 (UI/API 미구현)

---

## 3. 장애 공지 기준

### 3.1 결제 장애

- `payment_events.event_type = 'payment_compensation_failed'` 이벤트가 1시간 내 연속 3건 이상 발생하면 결제 장애로 판단
- 구조화 로그(`PAYMENT_CONFIRM_OPTION_B_TOSS_CANCEL_FAILED`, `PAYMENT_CANCEL_FAILED`)로 추가 확인
- 판단 기준 충족 시: Toss 대시보드 → PG사 공지 확인 후 서비스 내 공지 여부 결정 (MVP 기준 수동 확인)

### 3.2 판매자 승인 지연

- `seller_applications.status = 'pending'` 인 신청이 72시간 이상 미처리 시 운영팀에서 수동 확인
- `GET /api/admin/sellers/pending` 으로 조회

### 3.3 특정 가게 운영 중단

- `stores.status`를 `inactive`로 변경하면 소비자 탐색 화면에서 즉시 비노출
- MVP 기준 소비자에게 별도 안내 없음 (인앱 공지 미구현)
- 이미 예약된 주문은 수동 취소/환불 처리 필요

---

## 4. 사용자 계정 정지/활성화 정책

### 4.1 정지 기준

다음 상황에서 계정 정지 검토:

- 이용약관 위반 (허위 정보 신청, 부적절한 리뷰 등)
- 결제 사기 의심 (비정상적인 결제 취소 패턴)
- 허위 판매자 신청 서류 제출

### 4.2 정지 처리 (현재 수동)

1. Supabase Dashboard → `users` 테이블에서 해당 사용자의 `status` 필드를 `suspended`로 변경
2. Supabase Dashboard → Authentication → Users → "Sign out all sessions" 실행
3. `PATCH /api/admin/users/:userId/status` API는 미구현 상태 (T37 이후 별도 구현 task 생성 대상)

### 4.3 활성화 복구

- Supabase Dashboard → `users` 테이블에서 해당 사용자의 `status` 필드를 `active`로 변경

---

## 5. 신고/제재/분쟁 최소 운영 범위

### 5.1 MVP 기준 운영 범위

- 인앱 신고 UI 미구현: 이메일 채널(`contact@pickma.kr` 또는 운영팀 이메일)로만 신고 접수
- 분쟁 처리: 이메일 접수 → 운영팀 내부 확인 → 수동 처리

### 5.2 판매자 제재

- 이용약관 위반 판매자: `stores.status`를 `inactive`로 변경 (Supabase Dashboard 직접)
- 반복 위반 시 계정 정지 (4절 절차 적용)

### 5.3 MVP 이후 확장 대상

- 인앱 신고 기능
- 자동 제재 알림
- 분쟁 처리 워크플로우

---

## 6. 데이터 보존 기간

| 데이터 종류                                               | 보존 기간                                 | 근거                                |
| --------------------------------------------------------- | ----------------------------------------- | ----------------------------------- |
| 주문/결제 데이터 (`orders`, `payments`, `payment_events`) | 최소 5년                                  | 전자상거래법 제6조 (법무 검토 대상) |
| 판매자 신청 서류 (`seller_application_documents` Storage) | `docs/system_architecture.md` 14.3절 기준 | Storage lifecycle 정책              |
| Storage orphan 파일                                       | 30일 초과 시 cron 자동 삭제               | `src/app/api/cron/storage-cleanup`  |
| Vercel Function Logs (구조화 로그 포함)                   | Vercel 플랜 기본값 (30일)                 | Vercel 로그 보존 정책               |
| Auth 세션 토큰                                            | Supabase 기본값                           | Supabase Auth 정책                  |

> 주문/결제 데이터 5년 보존은 법무 검토 후 확정. 현재는 Supabase DB 기본 보존(삭제 없음) 상태.

---

## 7. 모니터링 지표

### 7.1 현재 모니터링 방법 (수동 확인, T71 알람 구현 전)

| 지표                                      | 확인 방법                                                                                       |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `processing` 30분 이상 잔류 주문          | `GET /api/admin/orders?status=processing` 수동 조회                                             |
| `payment_compensation_failed` 이벤트 건수 | Supabase Dashboard → `payment_events` 테이블 직접 조회                                          |
| 판매자 승인 처리 현황                     | `GET /api/admin/sellers/pending` 수동 조회                                                      |
| Admin 판매자 승인/거절 이력               | Vercel Function Logs에서 `ADMIN_APPROVE_SELLER_SUCCEEDED`, `ADMIN_REJECT_SELLER_SUCCEEDED` 검색 |
| Storage cleanup 결과                      | Vercel Function Logs에서 `STORAGE_CLEANUP_COMPLETED` 검색                                       |

### 7.2 구조화 로그 이벤트 목록

운영 핵심 경로의 구조화 로그 이벤트 전체 목록은 `docs/system_architecture.md` 19절 참고.

### 7.3 T71 알람 구현 후 자동화 대상

- `processing` 30분 이상 잔류 알람
- `payment_compensation_failed` 이벤트 임계치 알람
- Storage cleanup 실패 알람

---

## 8. 실서비스 전 체크리스트

### 8.1 필수 확인 항목

- [ ] Admin 계정 생성 완료 (2절 참고)
- [ ] Toss Payments live key 교체 (`TOSS_SECRET_KEY` 환경변수 변경)
- [ ] `PAYMENT_MOCK` 환경변수 미설정 또는 `false` 확인
- [ ] `CRON_SECRET` 환경변수 설정 확인
- [ ] Storage cleanup cron 활성화 확인 (`vercel.json` cron 스케줄)
- [ ] Supabase DB RLS 정책 확인 (15절 기준)
- [ ] 이메일 인증 발송 설정 확인 (Supabase Auth SMTP)

### 8.2 운영 준비 항목

- [ ] CS 담당자에게 1절 절차 공유
- [ ] `payment_events` 모니터링 주기 합의 (T71 이전 수동 기준)
- [ ] 판매자 승인 처리 SLA 합의 (3.2절 기준 72시간)
- [ ] 데이터 보존 기간 법무 검토 (6절 주문/결제 5년 기준)
