# API 명세

이 문서는 PickMa Route Handler API와 클라이언트 API 레이어의 계약을 정의한다.

---

## 1. 공통 규칙

### 1.1 데이터 접근

- 클라이언트는 Supabase DB를 직접 호출하지 않는다.
- 서비스 데이터는 `src/api` → `/api/*` Route Handler → Supabase를 경유한다.
- Supabase Auth는 SDK를 사용하며 `src/api/auth/authApi.ts`에서 감싼다.
- Mock 분기 기준 환경 변수는 `API_MOCK_ENABLED`로 통일한다.
- `API_MOCK_ENABLED=false`에서 아직 구현되지 않은 API는 HTTP 501과 `NOT_IMPLEMENTED` error code를 반환한다.

### 1.2 Naming

- request query/body/response 필드는 camelCase를 사용한다.
- DB 컬럼명 snake_case는 서버 service/mapper 내부에서만 다룬다.
- 날짜는 contract DTO에서 ISO string으로 표현한다.
- Domain type에서는 client mapper를 거쳐 `Date`를 사용할 수 있다.
- request query/body 타입은 `src/contracts`에 둔다.
- 화면 filter/form state 타입은 API request 타입과 분리하고, 필요 시 client API 호출 직전에 request DTO로 변환한다.

### 1.3 Response Envelope

성공:

```ts
export interface ApiSuccess<T> {
  statusCode: number;
  data: T;
  message?: string;
}
```

실패:

```ts
export interface ApiErrorResponse {
  statusCode: number;
  error: {
    code: string;
    message: string;
    details?: ValidationIssue[];
  };
}

export interface ValidationIssue {
  path: string;
  message: string;
}
```

- 실제 HTTP status와 body의 `statusCode`는 일치시킨다.
- `apiClient.get<T>()` / `post<T>()`는 성공 시 `data`만 반환한다.
- 실패 시 `ApiError`를 throw한다.

### 1.4 Pagination

목록 응답의 pagination은 envelope `meta`가 아니라 `data` 안에 포함한다.

```ts
export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
```

요청:

```text
?page=1&pageSize=20
```

### 1.5 Sort / Filter

- 정렬은 `sort`, `order`를 분리한다.
- `sort` 값은 Domain/Contract 기준 camelCase를 사용한다.

```text
?sort=endAt&order=asc
```

### 1.6 Validation

- request query/body 검증은 Zod를 사용한다.
- Zod schema는 Route Handler 가까이에 둔다.
- 검증 실패는 `VALIDATION_ERROR`로 변환하고 `details`에 field별 오류를 포함한다.

### 1.7 Priority

| 값  | 의미                            |
| --- | ------------------------------- |
| P0  | MVP 필수 구현                   |
| P1  | MVP 이후 또는 일정 내 선택 구현 |
| P2  | 확장 기능                       |

### 1.8 Status 값

API contract의 status 값은 JSON-safe string이며, DB 저장 값과 Domain Type 값이 1:1 대응한다고 가정하지 않는다.

| 대상    | API/DB 기준 값                                                                         | Domain 기준 값/파생값                                                                |
| ------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| User    | `active`, `suspended`, `deleted`                                                       | 동일                                                                                 |
| Store   | `pending`, `approved`, `rejected`, `inactive`                                          | 동일, `canSell = role seller && approved`                                            |
| Product | `active`, `closed`                                                                     | `status: active \| closed`, `isSoldOut`, `isExpired`, `displayStatus` 파생           |
| Order   | `payment_pending`, `reserved`, `ready`, `completed`, `cancelled`, `no_show`, `expired` | `paymentPending`, `reserved`, `ready`, `completed`, `cancelled`, `noShow`, `expired` |
| Payment | `pending`, `paid`, `failed`, `cancelled`, `refunded`                                   | 동일                                                                                 |

Product `displayStatus` 계산 기준:

```text
closed if status === 'closed'
expired if isExpired
soldOut if isSoldOut
available otherwise
```

---

## 2. Auth / User

### 2.1 Supabase Auth SDK 래퍼

서버 API가 아니라 클라이언트 API 래퍼로 제공한다.
`authApi`는 Supabase Auth client SDK 호출을 감싸고, cookie 기반 session 관리는 `@supabase/ssr`, session refresh와 보호 라우트 redirect는 `src/proxy.ts`가 담당한다.

| 기능          | 위치                         | Priority |
| ------------- | ---------------------------- | -------- |
| Google 로그인 | `authApi.signInWithGoogle()` | P0       |
| Kakao 로그인  | `authApi.signInWithKakao()`  | P0       |
| 로그아웃      | `authApi.signOut()`          | P0       |
| 세션 조회     | `authApi.getSession()`       | P0       |

### 2.2 사용자 API

| PRD ID    | 기능         | Method | API             | Auth | Priority |
| --------- | ------------ | ------ | --------------- | ---- | -------- |
| -         | 내 정보 조회 | GET    | `/api/users/me` | user | P0       |
| C-MY-03   | 프로필 수정  | PATCH  | `/api/users/me` | user | P1       |
| C-AUTH-03 | 회원 탈퇴    | DELETE | `/api/users/me` | user | P1       |

#### `GET /api/users/me`

Response:

```ts
export interface UserResponse {
  id: string;
  email: string;
  name: string;
  phone?: string;
  profileImage?: string;
  role: 'customer' | 'seller' | 'admin';
  status: 'active' | 'suspended' | 'deleted';
  createdAt: string;
  updatedAt: string;
}
```

DB source:

- `users`
- 필요 시 `stores`를 join해 seller 승인 상태를 함께 조회

---

## 3. Products

소비자 공개 상품 조회 API이다.

| PRD ID    | 기능           | Method | API                          | Auth   | Priority |
| --------- | -------------- | ------ | ---------------------------- | ------ | -------- |
| C-PROD-01 | 상품 목록 조회 | GET    | `/api/products`              | public | P0       |
| C-PROD-02 | 상품 상세 조회 | GET    | `/api/products/:productId`   | public | P0       |
| C-PROD-03 | 지역 필터      | GET    | `/api/products?region=`      | public | P0       |
| C-PROD-04 | 카테고리 필터  | GET    | `/api/products?categoryId=`  | public | P1       |
| C-PROD-05 | 검색           | GET    | `/api/products?keyword=`     | public | P1       |
| C-PROD-06 | 정렬           | GET    | `/api/products?sort=&order=` | public | P2       |

### 3.1 `GET /api/products`

Query:

```ts
export interface ProductListParams {
  page: number;
  pageSize: number;
  region?: string;
  categoryId?: string;
  keyword?: string;
  sort?: 'endAt' | 'discountRate' | 'createdAt';
  order?: 'asc' | 'desc';
}
```

기본 정렬은 `sort=endAt`, `order=asc`이다.

Response:

```ts
export type ProductListResponse = PaginatedResult<ProductListItemResponse>;

export interface ProductListItemResponse {
  id: string;
  storeId: string;
  storeName: string;
  categoryId?: string;
  categoryName?: string;
  menuItemId: string;
  name: string;
  image?: string;
  originalPrice: number;
  discountPrice: number;
  discountRate: number;
  stock: number;
  reservedStock: number;
  availableStock: number;
  isSoldOut: boolean;
  isExpired: boolean;
  displayStatus: 'available' | 'soldOut' | 'expired' | 'closed';
  endAt: string;
  pickupStartTime: string;
  pickupEndTime: string;
  status: 'active' | 'closed';
}
```

DB source:

- `products`
- `menu_items`
- `stores`
- `categories`

Mapping:

- `originalPrice`는 `menu_items.original_price`에서 가져온다.
- `availableStock = stock - reserved_stock`
- `discountRate = round((1 - discountPrice / originalPrice) * 100)`
- `isSoldOut = availableStock <= 0`
- `isExpired = endAt <= now`
- `displayStatus`는 `status`, `isSoldOut`, `isExpired` 기준으로 계산한다.

### 3.2 `GET /api/products/:productId`

Response:

```ts
export interface ProductDetailResponse extends ProductListItemResponse {
  description?: string;
  store: {
    id: string;
    name: string;
    description?: string;
    phone: string;
    address: string;
    addressDetail?: string;
    region: string;
    image?: string;
  };
}
```

---

## 4. Orders

| PRD ID     | 기능         | Method | API                           | Auth | Priority |
| ---------- | ------------ | ------ | ----------------------------- | ---- | -------- |
| C-ORDER-01 | 주문 생성    | POST   | `/api/orders`                 | user | P0       |
| C-MY-01    | 내 주문 목록 | GET    | `/api/orders`                 | user | P0       |
| C-MY-02    | 주문 상세    | GET    | `/api/orders/:orderId`        | user | P0       |
| C-ORDER-04 | 주문 취소    | PATCH  | `/api/orders/:orderId/cancel` | user | P1       |

### 4.1 `POST /api/orders`

Request:

```ts
export interface CreateOrderRequest {
  productId: string;
  quantity: number;
  pickupAt: string;
}
```

Response:

```ts
export interface CreateOrderResponse {
  id: string;
  orderNumber: string;
  orderName: string;
  paymentAmount: number;
  expiresAt: string;
}
```

Behavior:

- 로그인 사용자를 확인한다.
- 상품 판매 가능 상태, 재고, 마감 시간을 검증한다.
- Postgres RPC/transaction으로 `reserved_stock` 증가와 주문 생성을 atomic하게 처리한다.
- 주문 상태는 `payment_pending`으로 생성한다.
- `orderNumber`는 전역 고유 주문번호로 생성하며 PG 결제 요청의 주문 ID 필드에 그대로 매핑한다.
- `orderNumber` 형식은 `PM` + 주문 생성일 `YYYYMMDD` + 10자리 대문자 HEX token이다. 예: `PM20260430A1B2C3D4E5`.
- `pickupServiceDate`는 `pickupAt`의 날짜 부분으로 저장한다.
- `storeOrderNumber`와 `pickupNumber`는 결제 완료 전에는 생성하지 않는다.
- `expiresAt`은 주문 생성 시점 기준 결제 가능 만료 시간으로 설정한다. 초기 기준값은 생성 후 10분으로 둔다.
- Toss 결제 위젯에 필요한 `orderNumber`, `orderName`, `paymentAmount`를 반환한다.

DB source:

- `orders`
- `order_items`
- `products`
- `menu_items`

### 4.2 `GET /api/orders`

Query:

```ts
export interface OrderListParams {
  page: number;
  pageSize: number;
  status?:
    | 'payment_pending'
    | 'reserved'
    | 'ready'
    | 'completed'
    | 'cancelled'
    | 'no_show'
    | 'expired';
  sort: 'createdAt' | 'pickupAt';
  order: 'asc' | 'desc';
}
```

Response:

```ts
export interface OrderListItemResponse {
  id: string;
  orderNumber: string;
  storeOrderNumber?: string;
  pickupNumber?: string;
  storeId: string;
  storeName: string;
  totalAmount: number;
  discountAmount: number;
  paymentAmount: number;
  status:
    | 'payment_pending'
    | 'reserved'
    | 'ready'
    | 'completed'
    | 'cancelled'
    | 'no_show'
    | 'expired';
  pickupAt: string;
  pickupServiceDate: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderListResponse = PaginatedResult<OrderListItemResponse>;
```

### 4.3 `GET /api/orders/:orderId`

- 주문자 본인만 조회할 수 있다.
- 판매자/관리자 조회는 별도 API를 사용한다.

---

## 5. Payments

| PRD ID     | 기능         | Method | API                               | Auth       | Priority |
| ---------- | ------------ | ------ | --------------------------------- | ---------- | -------- |
| C-ORDER-03 | 결제 승인    | POST   | `/api/payments/confirm`           | user       | P0       |
| -          | 결제 Webhook | POST   | `/api/payments/webhook`           | external   | P1       |
| C-ORDER-04 | 결제 취소    | POST   | `/api/payments/:paymentId/cancel` | user/admin | P1       |

### 5.1 `POST /api/payments/confirm`

Request:

```ts
export interface ConfirmPaymentRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}
```

Behavior:

- 요청 사용자가 해당 주문의 주문자인지 확인한다.
- 주문 상태가 `payment_pending`인지 확인한다.
- `expiresAt`이 지난 주문은 Postgres RPC/transaction으로 `orders.status = expired` 처리와 `reserved_stock` 복구를 atomic하게 수행한 뒤 `ORDER_EXPIRED`를 반환한다.
- DB의 주문 금액과 `amount`가 일치하는지 검증한다.
- Toss `POST /v1/payments/confirm`을 서버에서 호출한다.
- 성공 시 `payments`를 저장하고 `orders` 상태를 확정한다.
- 결제 확정 시 Postgres RPC/transaction으로 `orders.status = reserved`, `stock` 감소, `reserved_stock` 감소, 매장 운영 번호 발급을 atomic하게 처리한다.
- `storeOrderNumber`는 `pickupServiceDate(YYYYMMDD)` + `-` + 7자리 매장별/픽업일별 결제완료 sequence로 생성한다. 예: `20260501-0000001`.
- `pickupNumber`는 같은 sequence에서 `A-01`부터 `Z-99`까지 생성한다. 매장+픽업일 기준 2,574건을 초과하면 주문 확정 실패로 처리한다.
- 취소/환불/노쇼가 발생해도 이미 발급된 `storeOrderNumber`와 `pickupNumber`는 회수하거나 재사용하지 않는다.
- 결제 Secret key는 서버에서만 사용한다.

### 5.2 결제 만료 처리

- 만료 대상은 `payment_pending` 주문만 해당한다.
- 초기 구현은 API 진입 시 lazy cleanup과 결제 confirm 시점 검사를 함께 사용한다.
- lazy cleanup은 상품/주문/결제 API 진입 시 만료된 `payment_pending` 주문을 `expired`로 변경하고 `reserved_stock`을 복구하는 RPC/transaction을 호출한다.
- 결제 confirm은 lazy cleanup과 별개로 반드시 `expiresAt`을 검사한다.
- scheduled job/cron 기반 정리는 MVP 이후 안정화 단계에서 추가한다.

DB source:

- `orders`
- `payments`
- `products`

### 5.3 `POST /api/payments/webhook`

- Toss가 호출하는 결제 상태 동기화 endpoint이다.
- MVP에서는 명세만 유지하고 구현 우선순위는 P1로 둔다.
- 서명/secret 검증과 멱등 처리가 필요하다.

---

## 6. Stores / Seller Registration

| PRD ID     | 기능              | Method | API              | Auth   | Priority |
| ---------- | ----------------- | ------ | ---------------- | ------ | -------- |
| S-STORE-01 | 가게 등록 신청    | POST   | `/api/stores`    | user   | P0       |
| S-STORE-03 | 내 가게 상태 조회 | GET    | `/api/stores/me` | user   | P0       |
| S-STORE-02 | 내 가게 정보 수정 | PATCH  | `/api/stores/me` | seller | P1       |

### 6.1 `POST /api/stores`

Request:

```ts
export interface CreateStoreRequest {
  name: string;
  description?: string;
  businessNumber: string;
  phone: string;
  address: string;
  addressDetail?: string;
  region: string;
  image?: string;
  openTime?: string;
  closeTime?: string;
}
```

Behavior:

- 로그인 사용자가 이미 가게를 가지고 있으면 실패한다.
- 생성된 가게 status는 승인 대기 상태이다.

DB source:

- `stores`
- `users`

---

## 7. Seller Products

| PRD ID    | 기능         | Method | API                                     | Auth   | Priority |
| --------- | ------------ | ------ | --------------------------------------- | ------ | -------- |
| S-PROD-01 | 상품 등록    | POST   | `/api/seller/products`                  | seller | P0       |
| S-PROD-04 | 내 상품 목록 | GET    | `/api/seller/products`                  | seller | P0       |
| S-PROD-02 | 상품 수정    | PATCH  | `/api/seller/products/:productId`       | seller | P0       |
| S-PROD-03 | 상품 삭제    | DELETE | `/api/seller/products/:productId`       | seller | P0       |
| S-PROD-05 | 재고 관리    | PATCH  | `/api/seller/products/:productId/stock` | seller | P1       |

Seller API는 `requireSeller()`를 통과해야 한다. 특정 상품이 해당 seller의 store 소유인지 service에서 최종 검증한다.

---

## 8. Seller Orders

| PRD ID     | 기능           | Method | API                                    | Auth   | Priority |
| ---------- | -------------- | ------ | -------------------------------------- | ------ | -------- |
| S-ORDER-01 | 주문 목록 조회 | GET    | `/api/seller/orders`                   | seller | P0       |
| S-ORDER-02 | 주문 상세 조회 | GET    | `/api/seller/orders/:orderId`          | seller | P0       |
| S-ORDER-03 | 픽업 완료 처리 | PATCH  | `/api/seller/orders/:orderId/complete` | seller | P0       |
| S-ORDER-04 | 노쇼 처리      | PATCH  | `/api/seller/orders/:orderId/no-show`  | seller | P1       |

Seller order API는 해당 주문이 seller의 store에 속하는지 검증한다.

---

## 9. Admin

Admin API는 `/api/admin/*`로 분리한다. 모든 Admin API는 `requireAdmin()`을 통과해야 한다.

### 9.1 Stores

| PRD ID     | 기능           | Method | API                                  | Priority |
| ---------- | -------------- | ------ | ------------------------------------ | -------- |
| A-STORE-01 | 승인 요청 목록 | GET    | `/api/admin/stores/pending`          | P0       |
| A-STORE-02 | 가게 승인      | PATCH  | `/api/admin/stores/:storeId/approve` | P0       |
| A-STORE-03 | 가게 거절      | PATCH  | `/api/admin/stores/:storeId/reject`  | P0       |
| A-STORE-04 | 전체 가게 조회 | GET    | `/api/admin/stores`                  | P0       |
| A-STORE-05 | 가게 상태 변경 | PATCH  | `/api/admin/stores/:storeId/status`  | P1       |

### 9.2 Users

| PRD ID    | 기능             | Method | API                               | Priority |
| --------- | ---------------- | ------ | --------------------------------- | -------- |
| A-USER-01 | 사용자 목록 조회 | GET    | `/api/admin/users`                | P1       |
| A-USER-02 | 사용자 상태 변경 | PATCH  | `/api/admin/users/:userId/status` | P1       |

### 9.3 Products / Orders

| PRD ID     | 기능           | Method | API                   | Priority |
| ---------- | -------------- | ------ | --------------------- | -------- |
| A-PROD-01  | 전체 상품 조회 | GET    | `/api/admin/products` | P1       |
| A-ORDER-01 | 전체 주문 조회 | GET    | `/api/admin/orders`   | P1       |

### 9.4 Dashboard

| PRD ID    | 기능        | Method | API                          | Priority |
| --------- | ----------- | ------ | ---------------------------- | -------- |
| A-DASH-01 | 플랫폼 통계 | GET    | `/api/admin/dashboard/stats` | P1       |
| A-DASH-02 | 일별 현황   | GET    | `/api/admin/dashboard/daily` | P2       |

---

## 10. Wishlist

| PRD ID  | 기능         | Method | API                      | Auth | Priority |
| ------- | ------------ | ------ | ------------------------ | ---- | -------- |
| C-MY-04 | 찜 목록 조회 | GET    | `/api/wishlist`          | user | P2       |
| C-MY-04 | 찜 추가      | POST   | `/api/wishlist`          | user | P2       |
| C-MY-04 | 찜 삭제      | DELETE | `/api/wishlist/:storeId` | user | P2       |

Wishlist는 MVP 이후 기능으로 둔다.

---

## 11. Error Code 초기 목록

초기 에러 코드는 `src/lib/errors`에서 중앙 관리한다.

### RPC 내부 예외 매핑 정책

`create_order` RPC는 입력 검증 실패 시 아래 예외를 raise한다. Route Handler는 이를 `VALIDATION_ERROR` (400)로 변환한다. Zod 스키마 검증이 선행되므로 정상 흐름에서는 도달하지 않아야 한다.

| RPC 예외                      | API 변환               |
| ----------------------------- | ---------------------- |
| `EMPTY_ITEMS`                 | `VALIDATION_ERROR` 400 |
| `INVALID_ITEM_FORMAT`         | `VALIDATION_ERROR` 400 |
| `INVALID_PICKUP_TIME`         | `VALIDATION_ERROR` 400 |
| `MULTIPLE_STORES_NOT_ALLOWED` | `VALIDATION_ERROR` 400 |

| Code                         | HTTP | 메시지                              |
| ---------------------------- | ---- | ----------------------------------- |
| `UNAUTHORIZED`               | 401  | 로그인이 필요합니다.                |
| `FORBIDDEN`                  | 403  | 접근 권한이 없습니다.               |
| `VALIDATION_ERROR`           | 400  | 요청 값이 올바르지 않습니다.        |
| `NOT_FOUND`                  | 404  | 요청한 리소스를 찾을 수 없습니다.   |
| `PRODUCT_NOT_FOUND`          | 404  | 상품을 찾을 수 없습니다.            |
| `ORDER_NOT_FOUND`            | 404  | 주문을 찾을 수 없습니다.            |
| `STORE_NOT_FOUND`            | 404  | 가게를 찾을 수 없습니다.            |
| `STORE_NOT_APPROVED`         | 403  | 승인된 가게만 사용할 수 있습니다.   |
| `STORE_ALREADY_EXISTS`       | 409  | 이미 등록된 가게가 있습니다.        |
| `OUT_OF_STOCK`               | 409  | 재고가 부족합니다.                  |
| `PRODUCT_EXPIRED`            | 409  | 판매가 마감된 상품입니다.           |
| `ORDER_EXPIRED`              | 409  | 결제 가능 시간이 만료되었습니다.    |
| `DUPLICATE_PRODUCT_IN_ORDER` | 400  | 주문 항목에 중복된 상품이 있습니다. |
| `PAYMENT_AMOUNT_MISMATCH`    | 400  | 결제 금액이 일치하지 않습니다.      |
| `PAYMENT_CONFIRM_FAILED`     | 502  | 결제 승인에 실패했습니다.           |
| `ORDER_NUMBER_EXHAUSTED`     | 503  | 주문번호가 모두 소진되었습니다.     |
| `PICKUP_NUMBER_EXHAUSTED`    | 409  | 픽업 번호가 모두 소진되었습니다.    |
| `NOT_IMPLEMENTED`            | 501  | 아직 구현되지 않은 API입니다.       |
| `INTERNAL_SERVER_ERROR`      | 500  | 서버 오류가 발생했습니다.           |
