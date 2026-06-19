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
