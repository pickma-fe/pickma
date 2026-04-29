# 시스템 아키텍처 설계서 (ERD)

## 픽마(PickMa)

---

# 1. 테이블 목록

| 테이블명          | 설명             | 비고                        |
| ----------------- | ---------------- | --------------------------- |
| `users`           | 사용자           | 소비자, 판매자, 관리자 통합 |
| `social_accounts` | 소셜 로그인 계정 | Google, Kakao               |
| `stores`          | 가게             | 판매자 1:1                  |
| `categories`      | 카테고리         | 상품 분류                   |
| `menu_items`      | 메뉴             | 판매자가 등록하는 기본 메뉴 |
| `products`        | 상품             | 실제 판매 상품              |
| `orders`          | 주문             | 예약 정보                   |
| `order_items`     | 주문 상품        | 주문-상품 연결              |
| `payments`        | 결제             | PG 결제 정보                |
| `wishlists`       | 찜               | 관심 가게                   |

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
| `open_time`       | timestamp    |                                 | 영업 시작      |
| `close_time`      | timestamp    |                                 | 영업 종료      |
| `status`          | enum         | NOT NULL, DEFAULT 'pending'     | 상태           |
| `reject_reason`   | varchar(500) |                                 | 거절 사유      |
| `created_at`      | timestamp    | NOT NULL, DEFAULT now()         | 생성일시       |
| `updated_at`      | timestamp    | NOT NULL, DEFAULT now()         | 수정일시       |

---

## 2.4 categories (카테고리)

| 컬럼명       | 타입        | 제약조건                | 설명        |
| ------------ | ----------- | ----------------------- | ----------- |
| `id`         | uuid        | PK                      | 카테고리 ID |
| `name`       | varchar(50) | UNIQUE, NOT NULL        | 카테고리명  |
| `icon`       | varchar(50) |                         | 아이콘      |
| `sort_order` | int         | NOT NULL, DEFAULT 0     | 정렬        |
| `created_at` | timestamp   | NOT NULL, DEFAULT now() | 생성일시    |

---

## 2.5 menu_items (메뉴)

| 컬럼명           | 타입         | 제약조건                 | 설명      |
| ---------------- | ------------ | ------------------------ | --------- |
| `id`             | uuid         | PK                       | 메뉴 ID   |
| `store_id`       | uuid         | FK → stores.id, NOT NULL | 가게 ID   |
| `category_id`    | uuid         | FK → categories.id       | 카테고리  |
| `name`           | varchar(100) | NOT NULL                 | 메뉴명    |
| `description`    | text         |                          | 설명      |
| `image`          | varchar(500) |                          | 이미지    |
| `original_price` | int          | NOT NULL                 | 기본 가격 |
| `created_at`     | timestamp    | NOT NULL, DEFAULT now()  | 생성일시  |
| `updated_at`     | timestamp    | NOT NULL, DEFAULT now()  | 수정일시  |

---

## 2.6 products (상품)

| 컬럼명              | 타입      | 제약조건                     | 설명      |
| ------------------- | --------- | ---------------------------- | --------- |
| `id`                | uuid      | PK                           | 상품 ID   |
| `store_id`          | uuid      | FK → stores.id, NOT NULL     | 가게 ID   |
| `menu_item_id`      | uuid      | FK → menu_items.id, NOT NULL | 메뉴 ID   |
| `category_id`       | uuid      | FK → categories.id           | 카테고리  |
| `discount_price`    | int       | NOT NULL                     | 할인가    |
| `stock`             | int       | NOT NULL, DEFAULT 0          | 총 재고   |
| `reserved_stock`    | int       | NOT NULL, DEFAULT 0          | 예약 재고 |
| `end_at`            | timestamp | NOT NULL                     | 판매 마감 |
| `pickup_start_time` | timestamp | NOT NULL                     | 픽업 시작 |
| `pickup_end_time`   | timestamp | NOT NULL                     | 픽업 종료 |
| `status`            | enum      | NOT NULL, DEFAULT 'active'   | 상태      |
| `created_at`        | timestamp | NOT NULL, DEFAULT now()      | 생성일시  |
| `updated_at`        | timestamp | NOT NULL, DEFAULT now()      | 수정일시  |

### 재고 관리 정책

- 구매 가능 수량: `stock - reserved_stock`
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

## 2.7 orders (주문)

| 컬럼명            | 타입         | 제약조건                            | 설명      |
| ----------------- | ------------ | ----------------------------------- | --------- |
| `id`              | uuid         | PK                                  | 주문 ID   |
| `order_number`    | varchar(20)  | UNIQUE, NOT NULL                    | 주문번호  |
| `user_id`         | uuid         | FK → users.id, NOT NULL             | 사용자    |
| `store_id`        | uuid         | FK → stores.id, NOT NULL            | 가게      |
| `total_amount`    | int          | NOT NULL                            | 총 금액   |
| `discount_amount` | int          | NOT NULL                            | 할인 금액 |
| `payment_amount`  | int          | NOT NULL                            | 결제 금액 |
| `status`          | enum         | NOT NULL, DEFAULT 'payment_pending' | 상태      |
| `pickup_at`       | timestamp    | NOT NULL                            | 픽업 시간 |
| `expires_at`      | timestamp    |                                     | 결제 만료 |
| `picked_up_at`    | timestamp    |                                     | 픽업 완료 |
| `cancelled_at`    | timestamp    |                                     | 취소 시간 |
| `cancel_reason`   | varchar(500) |                                     | 사유      |
| `created_at`      | timestamp    | NOT NULL, DEFAULT now()             | 생성일시  |
| `updated_at`      | timestamp    | NOT NULL, DEFAULT now()             | 수정일시  |

### 주문 정책

- 1 주문 = 1 가게
- 주문 생성 직후 상태는 `payment_pending`
- 결제 성공 시 `reserved`
- 픽업 시간 도래 시 `ready`
- 픽업 완료 시 `completed`
- 취소 시 `cancelled`
- 노쇼 처리 시 `no_show`
- 결제 만료 시 `expired`
- expires_at 이후 결제 불가
- expires_at 초기 기준값은 주문 생성 후 10분이다.
- 만료 대상은 `payment_pending` 주문만 해당한다.
- 만료 시 주문 상태를 `expired`로 변경하고 `reserved_stock`을 복구한다.
- 초기 구현은 API 진입 시 lazy cleanup과 결제 confirm 시점 검사를 함께 사용한다.
- scheduled job/cron 기반 정리는 MVP 이후 안정화 단계에서 추가한다.

---

## 2.8 order_items (주문 상품)

| 컬럼명           | 타입         | 제약조건         | 설명        |
| ---------------- | ------------ | ---------------- | ----------- |
| `id`             | uuid         | PK               | ID          |
| `order_id`       | uuid         | FK → orders.id   | 주문        |
| `product_id`     | uuid         | FK → products.id | 상품        |
| `product_name`   | varchar(100) | NOT NULL         | 이름 스냅샷 |
| `original_price` | int          | NOT NULL         | 원가        |
| `discount_price` | int          | NOT NULL         | 할인가      |
| `quantity`       | int          | NOT NULL         | 수량        |
| `subtotal`       | int          | NOT NULL         | 소계        |
| `created_at`     | timestamp    | DEFAULT now()    | 생성일      |

---

## 2.9 payments (결제)

| 컬럼명          | 타입         | 제약조건      | 설명      |
| --------------- | ------------ | ------------- | --------- |
| `id`            | uuid         | PK            | 결제 ID   |
| `order_id`      | uuid         | FK, UNIQUE    | 주문      |
| `payment_key`   | varchar(200) | UNIQUE        | PG 키     |
| `method`        | enum         | NOT NULL      | 결제 수단 |
| `amount`        | int          | NOT NULL      | 금액      |
| `status`        | enum         | NOT NULL      | 상태      |
| `paid_at`       | timestamp    |               | 결제 시간 |
| `refunded_at`   | timestamp    |               | 환불 시간 |
| `refund_reason` | varchar(500) |               | 사유      |
| `pg_response`   | jsonb        |               | 응답      |
| `created_at`    | timestamp    | DEFAULT now() | 생성      |
| `updated_at`    | timestamp    | DEFAULT now() | 수정      |

---

## 2.10 wishlists (찜)

| 컬럼명       | 타입      | 제약조건      | 설명   |
| ------------ | --------- | ------------- | ------ |
| `id`         | uuid      | PK            | ID     |
| `user_id`    | uuid      | FK            | 사용자 |
| `store_id`   | uuid      | FK            | 가게   |
| `created_at` | timestamp | DEFAULT now() | 생성   |

---

# 3. 인덱스 설계

- users(email)
- stores(region, status)
- products(store_id, status, end_at)
- orders(user_id, store_id, created_at)

---

# 4. 관계 요약

```
users 1:N orders
users 1:1 stores
stores 1:N menu_items
menu_items 1:N products
products 1:N order_items
orders 1:N order_items
orders 1:1 payments
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
- 시간: timestamp 통일
- 상품: menu + product 분리
- 주문: 단일 가게 구조
- 만료: expires_at 기반 처리

---
