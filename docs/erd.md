# 시스템 아키텍처 설계서 (ERD)

## 픽마(PickMa)

---

# 1. 테이블 목록

| 테이블명                       | 설명             | 비고                        |
| ------------------------------ | ---------------- | --------------------------- |
| `users`                        | 사용자           | 소비자, 판매자, 관리자 통합 |
| `social_accounts`              | 소셜 로그인 계정 | Google, Kakao               |
| `stores`                       | 가게             | 판매자 1:1                  |
| `seller_applications`          | 판매자 신청      | 판매자 심사 신청            |
| `seller_application_documents` | 판매자 신청 문서 | 신청 첨부 문서              |
| `categories`                   | 카테고리         | 상품 분류                   |
| `menu_items`                   | 메뉴             | 판매자가 등록하는 기본 메뉴 |
| `products`                     | 상품             | 실제 판매 상품              |
| `orders`                       | 주문             | 예약 정보                   |
| `order_items`                  | 주문 상품        | 주문-상품 연결              |
| `payments`                     | 결제             | PG 결제 정보                |
| `wishlists`                    | 찜               | 관심 가게                   |
| `store_order_sequences`        | 매장 주문 순번   | 매장+픽업일 기준 순번 관리  |

---

# 2. 테이블 상세 정의

> 상태 컬럼의 가능한 값은 DB 저장 값 기준이다. API contract와 Domain type의 상태값은 DB 값과 1:1 대응을 강제하지 않는다. 계산 상태(`isSoldOut`, `isExpired`, 표시용 status 등)는 mapper와 Domain type에서 파생할 수 있다.

## 2.1 users (사용자)

| 컬럼명          | 타입         | 제약조건                     | 설명              |
| --------------- | ------------ | ---------------------------- | ----------------- |
| `id`            | uuid         | PK                           | 사용자 ID         |
| `email`         | varchar(255) | UNIQUE, NOT NULL             | 이메일            |
| `name`          | varchar(100) | NOT NULL                     | 이름              |
| `phone`         | varchar(20)  |                              | 연락처            |
| `profile_image` | varchar(500) |                              | 프로필 이미지 URL |
| `role`          | enum         | NOT NULL, DEFAULT 'customer' | 역할              |
| `status`        | enum         | NOT NULL, DEFAULT 'active'   | 상태              |
| `created_at`    | timestamp    | NOT NULL, DEFAULT now()      | 생성일시          |
| `updated_at`    | timestamp    | NOT NULL, DEFAULT now()      | 수정일시          |

---

## 2.2 social_accounts (소셜 로그인 계정)

| 컬럼명        | 타입         | 제약조건                | 설명             |
| ------------- | ------------ | ----------------------- | ---------------- |
| `id`          | uuid         | PK                      | 소셜 계정 ID     |
| `user_id`     | uuid         | FK → users.id, NOT NULL | 사용자 ID        |
| `provider`    | enum         | NOT NULL                | 제공자           |
| `provider_id` | varchar(255) | NOT NULL                | 제공자 사용자 ID |
| `created_at`  | timestamp    | NOT NULL, DEFAULT now() | 생성일시         |

**UNIQUE:** `(provider, provider_id)`

---

## 2.3 stores (가게)

| 컬럼명            | 타입         | 제약조건                        | 설명           |
| ----------------- | ------------ | ------------------------------- | -------------- |
| `id`              | uuid         | PK                              | 가게 ID        |
| `user_id`         | uuid         | FK → users.id, UNIQUE, NOT NULL | 소유자 ID      |
| `name`            | varchar(100) | NOT NULL                        | 가게명         |
| `description`     | text         |                                 | 가게 소개      |
| `business_number` | varchar(20)  | UNIQUE, NOT NULL                | 사업자등록번호 |
| `phone`           | varchar(20)  | NOT NULL                        | 연락처         |
| `address`         | varchar(255) | NOT NULL                        | 주소           |
| `address_detail`  | varchar(255) |                                 | 상세 주소      |
| `region`          | varchar(50)  | NOT NULL                        | 지역           |
| `image`           | varchar(500) |                                 | 이미지         |
| `open_time`       | time         |                                 | 영업 시작      |
| `close_time`      | time         |                                 | 영업 종료      |
| `status`          | enum         | NOT NULL, DEFAULT 'approved'    | 상태           |
| `created_at`      | timestamp    | NOT NULL, DEFAULT now()         | 생성일시       |
| `updated_at`      | timestamp    | NOT NULL, DEFAULT now()         | 수정일시       |

신규 설계에서는 가게 등록을 seller 승인 이후에만 허용하고, 새 가게는 `approved` 상태로 생성한다. `pending`/`rejected`는 기존 구현/데이터 호환 또는 후속 마이그레이션 검토 대상으로 남긴다.

---

## 2.4 seller_applications (판매자 신청)

| 컬럼명                | 타입         | 제약조건                    | 설명           |
| --------------------- | ------------ | --------------------------- | -------------- |
| `id`                  | uuid         | PK                          | 신청 ID        |
| `user_id`             | uuid         | FK → users.id, NOT NULL     | 신청자 ID      |
| `status`              | varchar(20)  | NOT NULL, DEFAULT 'pending' | 심사 상태      |
| `business_number`     | varchar(20)  | NOT NULL                    | 사업자등록번호 |
| `company_name`        | varchar(200) | NOT NULL                    | 상호명         |
| `representative_name` | varchar(100) | NOT NULL                    | 대표자명       |
| `business_address`    | varchar(500) | NOT NULL                    | 사업장 주소    |
| `business_type`       | varchar(100) | NOT NULL                    | 업태           |
| `business_category`   | varchar(100) | NOT NULL                    | 종목           |
| `reject_reason`       | text         |                             | 거절 사유      |
| `reviewed_at`         | timestamp    |                             | 심사 일시      |
| `created_at`          | timestamp    | NOT NULL, DEFAULT now()     | 생성일시       |
| `updated_at`          | timestamp    | NOT NULL, DEFAULT now()     | 수정일시       |

**CHECK:** `status IN ('pending', 'approved', 'rejected')`

**UNIQUE 후보:**

- pending 신청은 사용자당 1개만 허용: `(user_id) WHERE status = 'pending'`
- approved 신청은 사용자당 1개만 허용: `(user_id) WHERE status = 'approved'`

`reviewed_by`는 저장하지 않는다. 관리자 작업자 추적은 후속 감사 로그 도메인으로 분리한다.

---

## 2.5 seller_application_documents (판매자 신청 문서)

| 컬럼명               | 타입         | 제약조건                              | 설명             |
| -------------------- | ------------ | ------------------------------------- | ---------------- |
| `id`                 | uuid         | PK                                    | 문서 ID          |
| `application_id`     | uuid         | FK → seller_applications.id, NOT NULL | 신청 ID          |
| `type`               | varchar(40)  | NOT NULL                              | 문서 타입        |
| `storage_path`       | varchar(500) | NOT NULL                              | Storage path     |
| `original_file_name` | varchar(255) | NOT NULL                              | 원본 파일명      |
| `content_type`       | varchar(100) | NOT NULL                              | MIME type        |
| `size`               | int          | NOT NULL, CHECK size > 0              | 파일 크기(bytes) |
| `created_at`         | timestamp    | NOT NULL, DEFAULT now()               | 생성일시         |

**CHECK:** `type IN ('business_license', 'id_card', 'bankbook', 'business_report')`

**UNIQUE:** `(application_id, type)`

파일은 private bucket `seller-application-documents`에 저장한다. 관리자 조회는 signed read URL로 처리한다.

---

## 2.6 categories (카테고리)

| 컬럼명       | 타입        | 제약조건                | 설명        |
| ------------ | ----------- | ----------------------- | ----------- |
| `id`         | uuid        | PK                      | 카테고리 ID |
| `name`       | varchar(50) | UNIQUE, NOT NULL        | 카테고리명  |
| `icon`       | varchar(50) |                         | 아이콘      |
| `sort_order` | int         | NOT NULL, DEFAULT 0     | 정렬        |
| `created_at` | timestamp   | NOT NULL, DEFAULT now() | 생성일시    |

---

## 2.7 menu_items (메뉴)

| 컬럼명           | 타입         | 제약조건                   | 설명      |
| ---------------- | ------------ | -------------------------- | --------- |
| `id`             | uuid         | PK                         | 메뉴 ID   |
| `store_id`       | uuid         | FK → stores.id, NOT NULL   | 가게 ID   |
| `category_id`    | uuid         | FK → categories.id         | 카테고리  |
| `status`         | varchar(20)  | NOT NULL, DEFAULT 'active' | 메뉴 상태 |
| `name`           | varchar(100) | NOT NULL                   | 메뉴명    |
| `description`    | text         |                            | 설명      |
| `image`          | varchar(500) |                            | 이미지    |
| `original_price` | int          | NOT NULL                   | 기본 가격 |
| `created_at`     | timestamp    | NOT NULL, DEFAULT now()    | 생성일시  |
| `updated_at`     | timestamp    | NOT NULL, DEFAULT now()    | 수정일시  |

**CHECK:** `status IN ('active', 'inactive')`

---

## 2.8 products (상품)

| 컬럼명              | 타입      | 제약조건                     | 설명                                                                |
| ------------------- | --------- | ---------------------------- | ------------------------------------------------------------------- |
| `id`                | uuid      | PK                           | 상품 ID                                                             |
| `store_id`          | uuid      | FK → stores.id, NOT NULL     | 가게 ID                                                             |
| `menu_item_id`      | uuid      | FK → menu_items.id, NOT NULL | 메뉴 ID                                                             |
| `category_id`       | uuid      | FK → categories.id           | 카테고리                                                            |
| `discount_price`    | int       | NOT NULL                     | 할인가                                                              |
| `original_price`    | int       | NOT NULL, DEFAULT 0          | 원가 snapshot (등록 시점 고정, INSERT 트리거로 menu_items에서 복사) |
| `available_stock`   | int       | GENERATED ALWAYS AS STORED   | 구매 가능 재고 (`stock - reserved_stock`)                           |
| `discount_rate`     | int       | GENERATED ALWAYS AS STORED   | 할인율 (`round((1 - discount_price / original_price) * 100)`)       |
| `stock`             | int       | NOT NULL, DEFAULT 0          | 총 재고                                                             |
| `reserved_stock`    | int       | NOT NULL, DEFAULT 0          | 예약 재고                                                           |
| `end_at`            | timestamp | NOT NULL                     | 판매 마감                                                           |
| `pickup_start_time` | time      | NOT NULL                     | 픽업 시작                                                           |
| `pickup_end_time`   | time      | NOT NULL                     | 픽업 종료                                                           |
| `status`            | enum      | NOT NULL, DEFAULT 'active'   | 상태                                                                |
| `created_at`        | timestamp | NOT NULL, DEFAULT now()      | 생성일시                                                            |
| `updated_at`        | timestamp | NOT NULL, DEFAULT now()      | 수정일시                                                            |

### 재고 관리 정책

- 구매 가능 수량: `available_stock` generated column (`stock - reserved_stock`)
- 주문 생성 시 `reserved_stock` 증가
- 결제 완료 시 `stock` 감소 + `reserved_stock` 감소
- 실패/취소/만료 시 `reserved_stock` 복구
- 주문 생성, 결제 확정, 예약 해제에 따른 재고 변경은 Postgres function/RPC 또는 transaction으로 atomic하게 처리한다.
- Route Handler service에서 여러 Supabase 쿼리를 순차 조합해 재고를 변경하지 않는다.

### 판매 마감 정책

- `end_at` 이후 주문 불가
- 상품 저장 상태는 `active`, `closed`를 사용한다.
- 품절과 시간 만료는 `stock`, `reserved_stock`, `end_at`으로 계산한다.

### 구조 정책

- menu_items = 정적 메뉴
- products = 판매 단위

---

## 2.9 orders (주문)

| 컬럼명                 | 타입         | 제약조건                            | 설명                                                                         |
| ---------------------- | ------------ | ----------------------------------- | ---------------------------------------------------------------------------- |
| `id`                   | uuid         | PK                                  | 주문 ID                                                                      |
| `order_number`         | varchar(20)  | UNIQUE, NOT NULL                    | PickMa 내부 전역 주문번호 (provider별 외부 주문 ID는 payments 테이블에 저장) |
| `user_id`              | uuid         | FK → users.id, NOT NULL             | 사용자                                                                       |
| `store_id`             | uuid         | FK → stores.id, NOT NULL            | 가게                                                                         |
| `total_amount`         | int          | NOT NULL                            | 총 금액                                                                      |
| `discount_amount`      | int          | NOT NULL                            | 할인 금액                                                                    |
| `payment_amount`       | int          | NOT NULL                            | 결제 금액                                                                    |
| `status`               | enum         | NOT NULL, DEFAULT 'payment_pending' | 상태                                                                         |
| `pickup_at`            | timestamp    | NOT NULL                            | 사용자가 선택한 픽업 시간                                                    |
| `pickup_service_date`  | date         | NOT NULL                            | 픽업 운영 기준일                                                             |
| `store_order_sequence` | int          |                                     | 매장+픽업일 기준 결제완료 순번                                               |
| `store_order_number`   | varchar(16)  |                                     | 판매자 운영용 주문번호                                                       |
| `pickup_number`        | varchar(4)   |                                     | 매장 현장 픽업번호                                                           |
| `expires_at`           | timestamp    |                                     | 결제 만료                                                                    |
| `picked_up_at`         | timestamp    |                                     | 픽업 완료                                                                    |
| `cancelled_at`         | timestamp    |                                     | 취소 시간                                                                    |
| `cancel_reason`        | varchar(500) |                                     | 사유                                                                         |
| `created_at`           | timestamp    | NOT NULL, DEFAULT now()             | 생성일시                                                                     |
| `updated_at`           | timestamp    | NOT NULL, DEFAULT now()             | 수정일시                                                                     |

### 주문 정책

- 1 주문 = 1 가게
- 주문 생성 직후 상태는 `payment_pending`
- 결제 성공 시 `reserved` (접수 대기)
- seller가 접수 처리 시 `accepted` (준비 중)
- seller가 준비 완료 처리 시 `ready` (픽업 가능) — MVP에서는 seller 수동 전환 (cron 없음)
- seller가 픽업 완료 처리 시 `completed`
- 취소 시 `cancelled`
- 노쇼 처리 시 `no_show`
- 결제 만료 시 `expired`
- expires_at 이후 결제 불가
- expires_at 초기 기준값은 주문 생성 후 10분이다.
- 만료 대상은 `payment_pending` 주문만 해당한다.
- 만료 시 주문 상태를 `expired`로 변경하고 `reserved_stock`을 복구한다.
- 초기 구현은 API 진입 시 lazy cleanup과 결제 confirm 시점 검사를 함께 사용한다.
- scheduled job/cron 기반 정리는 MVP 이후 안정화 단계에서 추가한다.

### 주문번호 정책

- `order_number`는 PickMa의 전역 고유 주문번호이며 PG 결제 요청의 주문 ID 필드에 그대로 매핑한다.
  - Toss Payments: `orderId = order_number`
  - 다른 PG 사용 시에도 해당 PG의 주문번호 필드(`merchant_uid`, `oid`, `orderNo` 등)에 매핑한다.
- `order_number`는 주문 생성(`payment_pending`) 시점에 생성하고, 결제 성공/실패/만료와 무관하게 변경하지 않는다.
- 형식은 `PM` + 주문 생성일 `YYYYMMDD` + 10자리 대문자 HEX token을 사용한다.
  - 예: `PM20260430A1B2C3D4E5`
  - 길이: 20자 (`varchar(20)`)
  - 10자리 HEX 조합 수: `16^10 = 1,099,511,627,776`
  - 날짜 prefix로 조합 공간이 생성일별로 분리된다.
  - 하루 100,000건 생성 시 단순 birthday approximation 충돌 확률은 약 0.45%이며, DB `UNIQUE` 충돌 시 RPC에서 재시도한다.
- `store_order_number`와 `pickup_number`는 결제 완료(`reserved`) 시점에 생성한다. 결제 대기 또는 만료 주문에는 부여하지 않는다.
- `pickup_service_date`는 `pickup_at`의 날짜 부분이며, 매장 운영 번호의 sequence bucket 기준이다.
- `store_order_sequence`는 `(store_id, pickup_service_date)` 기준 결제 완료 순서이다. 취소/환불/노쇼가 발생해도 회수하거나 재사용하지 않는다.
- `store_order_number` 형식은 `pickup_service_date(YYYYMMDD)` + `-` + 7자리 sequence이다.
  - 예: `20260501-0000001`
- `pickup_number`는 같은 `store_order_sequence`에서 파생한다.
  - `1` → `A-01`, `99` → `A-99`, `100` → `B-01`, `2574` → `Z-99`
  - 매장+픽업일 기준 최대 `26 * 99 = 2,574`건이며, 초과 시 주문 확정을 실패 처리한다.

**UNIQUE:**

- `(store_id, pickup_service_date, store_order_sequence)` where `store_order_sequence IS NOT NULL`
- `(store_id, pickup_service_date, store_order_number)` where `store_order_number IS NOT NULL`
- `(store_id, pickup_service_date, pickup_number)` where `pickup_number IS NOT NULL`

---

## 2.10 order_items (주문 상품)

| 컬럼명           | 타입         | 제약조건                   | 설명        |
| ---------------- | ------------ | -------------------------- | ----------- |
| `id`             | uuid         | PK                         | ID          |
| `order_id`       | uuid         | FK → orders.id, NOT NULL   | 주문        |
| `product_id`     | uuid         | FK → products.id, NOT NULL | 상품        |
| `product_name`   | varchar(100) | NOT NULL                   | 이름 스냅샷 |
| `original_price` | int          | NOT NULL                   | 원가        |
| `discount_price` | int          | NOT NULL                   | 할인가      |
| `quantity`       | int          | NOT NULL                   | 수량        |
| `subtotal`       | int          | NOT NULL                   | 소계        |
| `created_at`     | timestamp    | NOT NULL, DEFAULT now()    | 생성일      |

---

## 2.11 payments (결제)

| 컬럼명                 | 타입         | 제약조건             | 설명                                |
| ---------------------- | ------------ | -------------------- | ----------------------------------- |
| `id`                   | uuid         | PK                   | 결제 ID                             |
| `order_id`             | uuid         | FK, UNIQUE, NOT NULL | 주문                                |
| `provider`             | enum         | NOT NULL             | 결제 승인 주체                      |
| `provider_payment_key` | varchar(200) |                      | provider 결제 키                    |
| `provider_order_id`    | varchar(200) |                      | provider에 전달한 주문 식별자       |
| `method`               | enum         | NOT NULL             | 결제 수단                           |
| `method_detail`        | text         |                      | provider 결제수단 상세 (예: 카드명) |
| `amount`               | int          | NOT NULL             | 금액                                |
| `status`               | enum         | NOT NULL             | 상태                                |
| `paid_at`              | timestamp    |                      | 결제 시간                           |
| `refunded_at`          | timestamp    |                      | 환불 시간                           |
| `refund_reason`        | varchar(500) |                      | 사유                                |
| `pg_response`          | jsonb        |                      | provider raw 응답                   |
| `created_at`           | timestamp    | DEFAULT now()        | 생성                                |
| `updated_at`           | timestamp    | DEFAULT now()        | 수정                                |

**UNIQUE:**

- `order_id` (주문당 1건)
- `(provider, provider_payment_key)` WHERE `provider_payment_key IS NOT NULL`
- `(provider, provider_order_id)` WHERE `provider_order_id IS NOT NULL`

**정산/수수료 정책**: `payments` 테이블은 provider 결제 기록과 주문 확정에 집중한다. 수수료율, 정산 주기, 취소/환불/노쇼 시 정산 기준은 후속 Settlement/Fee Policy phase에서 별도 DB schema로 추가한다.

**`confirm_payment` RPC signature** (Phase 10 갱신):

- 파라미터: `p_order_number`, `p_provider`, `p_provider_payment_key`, `p_provider_order_id`, `p_method`, `p_method_detail`, `p_amount`, `p_pg_response`
- 주문 확정, 재고 확정, 번호 발급은 atomic하게 처리한다.

---

## 2.12 wishlists (찜)

| 컬럼명       | 타입      | 제약조건      | 설명   |
| ------------ | --------- | ------------- | ------ |
| `id`         | uuid      | PK            | ID     |
| `user_id`    | uuid      | FK, NOT NULL  | 사용자 |
| `store_id`   | uuid      | FK, NOT NULL  | 가게   |
| `created_at` | timestamp | DEFAULT now() | 생성   |

**UNIQUE:** `(user_id, store_id)`

---

## 2.13 store_order_sequences (매장 주문 순번)

| 컬럼명                | 타입      | 제약조건                 | 설명                            |
| --------------------- | --------- | ------------------------ | ------------------------------- |
| `store_id`            | uuid      | FK → stores.id, NOT NULL | 가게                            |
| `pickup_service_date` | date      | NOT NULL                 | 픽업 운영 기준일                |
| `last_sequence`       | int       | NOT NULL, DEFAULT 0      | 마지막으로 발급한 결제완료 순번 |
| `created_at`          | timestamp | NOT NULL, DEFAULT now()  | 생성일시                        |
| `updated_at`          | timestamp | NOT NULL, DEFAULT now()  | 수정일시                        |

**PK 또는 UNIQUE:** `(store_id, pickup_service_date)`

### 순번 발급 정책

- `confirm_payment` RPC에서 결제 승인 후 `store_order_sequences`를 증가시키고 발급된 값을 `orders.store_order_sequence`에 저장한다.
- 동시 결제에서도 중복 순번이 생기지 않도록 `INSERT ... ON CONFLICT ... DO UPDATE SET last_sequence = last_sequence + 1 RETURNING last_sequence` 형태로 row lock을 사용한다.
- `last_sequence > 2574`이면 `pickup_number`를 만들 수 없으므로 주문 확정을 실패 처리한다. Phase 7 결제 구현에서는 PG 승인 전 capacity 선검사 또는 승인 후 자동 취소/환불 정책을 함께 확정한다.

---

# 3. 인덱스 설계

- users(email)
- stores(region, status)
- products(store_id, status, end_at)
- orders(user_id, store_id, created_at)
- orders(store_id, pickup_service_date, store_order_sequence)
- store_order_sequences(store_id, pickup_service_date)

---

# 4. 관계 요약

```text
users 1:N orders
users 1:N social_accounts
users 1:N wishlists
users 1:1 stores
users 1:N seller_applications
seller_applications 1:N seller_application_documents
stores 1:N wishlists
stores 1:N menu_items
menu_items 1:N products
products 1:N order_items
orders 1:N order_items
orders 1:1 payments
stores 1:N store_order_sequences
```

---

# 5. Supabase 정책

- users: 본인만 수정
- stores: 소유자만 수정
- products: 소유자만 수정
- orders: 사용자/가게만 조회

---

# 6. 확장 고려사항

| 기능           | 확장                   |
| -------------- | ---------------------- |
| 재고 고도화    | inventory_reservations |
| 다중 가게 주문 | store_orders           |
| 리뷰           | reviews                |
| 쿠폰           | coupons                |
| 알림           | notifications          |

---

# 7. 핵심 설계 요약

- 재고: reserved_stock 기반
- 시간: timestamp 통일, 단 open_time/close_time/pickup_start_time/pickup_end_time은 time, pickup_service_date는 date
- 상품: menu + product 분리
- 주문: 단일 가게 구조
- 만료: expires_at 기반 처리

---

# 8. 예정 스키마 변경 후보

후속 task의 스키마 변경 후보 목록과 운영 원칙은 `docs/migration_policy.md`를 참고한다.

---
