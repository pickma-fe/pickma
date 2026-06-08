# API 명세

이 문서는 PickMa Route Handler API와 클라이언트 API 레이어의 계약을 정의한다.

---

## 1. 공통 규칙

### 1.1 데이터 접근

- 클라이언트는 Supabase DB를 직접 호출하지 않는다.
- 서비스 데이터는 `src/api` → `/api/*` Route Handler → Supabase를 경유한다.
- Supabase Auth는 SDK를 사용하며 `src/api/auth/authApi.ts`에서 감싼다. OAuth와 email/password 모두 자체 세션 구현 없이 Supabase Auth provider를 사용한다.
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

| 대상    | API/DB 기준 값                                                                                                   | Domain 기준 값/파생값                                                                                                  |
| ------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| User    | `active`, `suspended`, `deleted`                                                                                 | 동일                                                                                                                   |
| Store   | `status: active \| inactive`, `operation_status: open \| closed`                                                 | 신규 가게는 `active/open`으로 생성. `canSell = role === 'seller' && status === 'active' && operationStatus === 'open'` |
| Product | `active`, `closed`                                                                                               | `status: active \| closed`, `isSoldOut`, `isExpired`, `displayStatus` 파생                                             |
| Order   | `payment_pending`, `processing`, `reserved`, `accepted`, `ready`, `completed`, `cancelled`, `no_show`, `expired` | `paymentPending`, `processing`, `reserved`, `accepted`, `ready`, `completed`, `cancelled`, `noShow`, `expired`         |
| Payment | `pending`, `paid`, `failed`, `cancelled`, `refunded`                                                             | 동일                                                                                                                   |

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

| 기능                 | 위치                                 | Priority |
| -------------------- | ------------------------------------ | -------- |
| Google 로그인        | `authApi.signInWithGoogle()`         | P0       |
| Kakao 로그인         | `authApi.signInWithKakao()`          | P0       |
| 이메일 인증 요청     | `authApi.requestEmailVerification()` | P0       |
| OTP 검증             | `authApi.verifyEmailOtp()`           | P0       |
| Email 회원가입 완료  | `authApi.completeEmailSignup()`      | P0       |
| Email 로그인         | `authApi.signInWithEmail()`          | P0       |
| 비밀번호 재설정 요청 | `authApi.resetPasswordForEmail()`    | P1       |
| 비밀번호 변경        | `authApi.updatePassword()`           | P1       |
| 로그아웃             | `authApi.signOut()`                  | P0       |
| 세션 조회            | `authApi.getSession()`               | P0       |

`authApi.signUpWithEmail()`은 가입 전 이메일 선인증 방식으로 전환됨에 따라 제거되었다. 회원가입은 `requestEmailVerification → verifyEmailOtp → completeEmailSignup` 3단계로 처리한다.

Email/password auth wrapper 입력 DTO와 이메일 선인증 Route Handler contract는 모두 `src/contracts/auth.ts`에 둔다.

신규 비밀번호 설정/변경 입력(`CompleteEmailSignupRequest`, `UpdatePasswordRequest`)은 최소 10자. 복잡도 요구 없음 (T60 정책). 로그인 입력(`SignInWithEmailRequest`)에는 길이 제약을 적용하지 않는다.

```ts
export interface SignInWithEmailRequest {
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  email: string;
  redirectPath?: string;
}

export interface UpdatePasswordRequest {
  password: string; // min 10자
}

export interface RequestEmailVerificationRequest {
  email: string;
}

export interface RequestEmailVerificationResponse {
  expiresAt: string;
}

export interface VerifyEmailOtpRequest {
  email: string;
  code: string;
}

export interface VerifyEmailOtpResponse {
  verificationToken: string;
  expiresAt: string;
}

export interface CompleteEmailSignupRequest {
  email: string;
  password: string; // min 10자
  name: string;
  verificationToken: string;
  marketingAgreed: boolean;
}
```

### 2.2 이메일 선인증 Route Handler API

email/password 회원가입은 서버 Route Handler를 통해 처리한다.

| 기능                   | Method | API                                     | Auth   | Priority |
| ---------------------- | ------ | --------------------------------------- | ------ | -------- |
| OTP 발송 요청          | POST   | `/api/auth/email-verifications/request` | public | P0       |
| OTP 검증               | POST   | `/api/auth/email-verifications/verify`  | public | P0       |
| 이메일 선인증 회원가입 | POST   | `/api/auth/email-signup`                | public | P0       |

#### `POST /api/auth/email-verifications/request`

Request: `RequestEmailVerificationRequest`

Response: `RequestEmailVerificationResponse`

Behavior:

- email normalize + Zod validation
- emailHash/ipHash HMAC 생성 (raw email/IP는 저장하지 않음)
- `checkAndIncrementRequestLimit()`: email/IP rate limit 먼저 적용. 이메일 존재 여부와 무관하게 count 증가
- rate limit 초과 시 `RATE_LIMIT_EXCEEDED` 429 반환 (이메일 존재 여부 미노출)
- `public.users.email` 중복 확인 → 존재하면 `AUTH_EMAIL_ALREADY_EXISTS` 409
- 6자리 OTP 생성, salt+hash 저장
- `issueChallenge()`: 새 active challenge 발급. 이전 active challenge는 즉시 무효화
- Resend HTTP API `fetch`로 OTP 메일 발송 (Resend SDK 미사용)
- 발송 성공: challenge `status = 'sent'`
- 발송 실패: challenge `status = 'send_failed'`, `AUTH_EMAIL_SEND_FAILED` 502 반환. 이전 OTP 복구 없음
- `expiresAt` 반환

#### `POST /api/auth/email-verifications/verify`

Request: `VerifyEmailOtpRequest`

Response: `VerifyEmailOtpResponse`

Behavior:

- emailHash로 active challenge 조회 (`status = 'sent'`, 미만료)
- Redis에 이전 challenge가 남아 있어도 active challenge가 아니면 검증하지 않음
- OTP 검증 attempt count 증가 → 5회 초과 시 `AUTH_EMAIL_OTP_ATTEMPT_LIMIT_EXCEEDED` 429
- OTP hash 비교 실패 시 `AUTH_EMAIL_OTP_INVALID` 400
- 성공 시 verification token 생성, token hash 저장, challenge `status = 'verified'`
- challenge TTL을 verification token TTL 이상으로 연장
- raw verification token을 response로 1회 반환

#### `POST /api/auth/email-signup`

Request: `CompleteEmailSignupRequest`

Response: `200 { data: null }`

Behavior:

- verification token hash + emailHash + expiry + status 검증
- `verified → signup_in_progress` 원자적 전환 (동시 제출 방지)
- 이미 `signup_in_progress`이면 `AUTH_EMAIL_SIGNUP_IN_PROGRESS` 409 (error details에 `retryAfterSeconds` 포함)
- `auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name } })`
- `auth.admin.createUser()` conflict → token을 `consumed`로 닫고 `AUTH_EMAIL_ALREADY_EXISTS` 409
- `public.users` row 생성 (`id`, `email`, `name`, `marketing_agreed`, `marketing_agreed_at`, role/status 기본값)
- `public.users` 생성 실패 + 보상 삭제 성공 → token `verified`로 되돌려 재시도 가능
- `public.users` 생성 실패 + 보상 삭제 실패 → token `consumed`로 닫고 `INTERNAL_SERVER_ERROR`
- 성공 시 token `status = 'consumed'`
- 클라이언트는 응답 후 `signInWithPassword`로 세션 생성

### 2.3 사용자 API

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
- 판매자 onboarding 상태는 `/api/seller/onboarding-status`에서 별도로 조회한다.

#### `PATCH /api/users/me`

Request:

```ts
export interface UpdateMeRequest {
  name?: string;
}
```

Response: `UserResponse`

- 수정할 필드가 하나 이상 있어야 한다.
- `active` 상태 사용자만 허용한다.

---

## 3. Files

공통 파일 업로드 URL 발급 API이다. 도메인별 API는 파일 자체를 직접 받지 않고, 도메인 hook이 먼저 파일을 업로드한 뒤 반환된 `storagePath`를 최종 request에 반영한다.

| 기능                   | Method | API                     | Auth | Priority |
| ---------------------- | ------ | ----------------------- | ---- | -------- |
| signed upload URL 발급 | POST   | `/api/files/upload-url` | user | P0       |
| orphan 파일 cleanup    | DELETE | `/api/files`            | user | P1       |

### 3.1 `POST /api/files/upload-url`

Request:

```ts
export type FileUploadPurpose =
  | 'seller_application_document'
  | 'store_image'
  | 'seller_product_image'
  | 'profile_image';

export type SellerApplicationDocumentType =
  | 'business_license'
  | 'food_service_permit'
  | 'bank_account';

export interface CreateFileUploadUrlRequest {
  purpose: FileUploadPurpose;
  fileName: string;
  mimeType: string;
  fileSize: number;
  documentType?: SellerApplicationDocumentType;
}
```

Response:

```ts
export interface FileUploadUrlResponse {
  storagePath: string;
  signedUrl: string;
  headers?: Record<string, string>;
}
```

Behavior:

- 로그인 active user만 호출할 수 있다.
- 서버가 `purpose` 기준으로 bucket, public/private 정책, path prefix, 허용 MIME type, 최대 용량을 결정한다.
- storage path는 서버가 생성한다. 클라이언트가 path를 직접 지정하지 않는다.
- `seller_application_document`는 `documentType`이 필수이며, 허용 타입은 `image/png`, `image/jpeg`, `application/pdf`, 최대 용량은 파일당 10MB이다.
- `seller_application_document`는 private bucket `seller-application-documents`에 저장한다.
- `store_image`, `seller_product_image`, `profile_image`는 각각 public bucket `store-images`, `product-images`, `profile-images`에 저장한다.
- `store_image`는 `requireSeller()` 통과 사용자가 호출할 수 있다.
- `seller_product_image`는 `requireSellerStore()`(`stores.status = 'active'`) 통과 사용자가 호출할 수 있다.
- `profile_image`는 로그인 active user가 호출할 수 있다.
- `seller_application_document`는 판매자 신청 생성 가능 상태의 active user만 호출할 수 있다. 이미 seller이거나 pending/approved 신청이 있으면 실패한다.

Purpose별 권한 정책:

| purpose                       | required role | store 조건                                    | 추가 조건                                    |
| ----------------------------- | ------------- | --------------------------------------------- | -------------------------------------------- |
| `profile_image`               | active user   | 없음                                          | 없음                                         |
| `seller_application_document` | active user   | 없음                                          | pending/approved 신청 없음, seller role 아님 |
| `store_image`                 | seller        | 없음 (store 생성 전 업로드 허용)              | 없음                                         |
| `seller_product_image`        | seller        | store 존재 및 `stores.status = 'active'` 필수 | 없음                                         |

`store_image`에 store 존재 체크를 하지 않는 이유: seller 승인 시 store가 자동 생성되지 않으며, store 최초 생성 시 이미지를 업로드해야 하므로 이 시점에 store가 아직 존재하지 않는다. `seller_product_image`는 상품 등록이 store 생성 이후에만 가능하므로 store 존재가 보장된다.

클라이언트 API helper는 `createUploadUrl → signed URL 업로드 → storagePath 반환` 흐름을 감싼다. TanStack Query mutation은 도메인 hook에서 전체 submit 단위로 관리한다.

### 3.2 `DELETE /api/files`

Request:

```ts
export interface DeleteFilesRequest {
  storagePaths: string[];
}
```

Response: `null`

Behavior:

- `requireActiveUser()` 통과 사용자만 호출할 수 있다.
- `storagePaths`는 1개 이상, 50개 이하이며 빈 문자열을 포함할 수 없다.
- 각 `storagePath`는 `{userId}/` prefix로 소유권을 검증한다. 하나라도 소유권이 없으면 403을 반환하고 삭제를 실행하지 않는다.
- 소유권 검증 통과 시 `seller_application_documents` 테이블에서 해당 경로가 참조 중인지 확인한다. 하나라도 참조 중이면 403을 반환하고 삭제를 실행하지 않는다.
- 참조 확인 통과 시 service role client로 `seller-application-documents` bucket에서 삭제한다.
- Storage 삭제 실패 시 500을 반환할 수 있다. 호출 측 hook이 이를 best-effort로 처리(실패 무시 + 로깅)한다.

에러 정책:

| 조건                                            | HTTP | error code              |
| ----------------------------------------------- | ---- | ----------------------- |
| 미인증 또는 inactive user                       | 401  | `UNAUTHORIZED`          |
| `storagePath`에 타 userId prefix                | 403  | `FORBIDDEN`             |
| `seller_application_documents`에 참조 중인 경로 | 403  | `FORBIDDEN`             |
| body 검증 실패                                  | 400  | `VALIDATION_ERROR`      |
| Storage 삭제 실패                               | 500  | `INTERNAL_SERVER_ERROR` |

---

## 4. Catalog / Products

카테고리와 판매자 메뉴는 상품 탐색/등록의 선행 도메인이다. 소비자 상품 목록은 category/menu join 결과를 내려주고, 판매자 상품 등록은 기존 menu item을 선택해 product를 생성한다.

### 4.0 Category / Menu APIs

| 기능                      | Method | API                          | Auth   | Priority |
| ------------------------- | ------ | ---------------------------- | ------ | -------- |
| 공개 카테고리 목록        | GET    | `/api/categories`            | public | P0       |
| 판매자 메뉴 목록          | GET    | `/api/seller/menu-items`     | seller | P0       |
| 판매자 메뉴 생성          | POST   | `/api/seller/menu-items`     | seller | P0       |
| 판매자 메뉴 수정          | PATCH  | `/api/seller/menu-items/:id` | seller | P0       |
| 판매자 메뉴 삭제/비활성화 | DELETE | `/api/seller/menu-items/:id` | seller | P1       |

`/api/categories` Response:

```ts
export interface CategoryResponse {
  id: string;
  name: string;
  icon?: string;
  sortOrder?: number;
}
```

Seller menu request/response:

```ts
export interface MenuItemResponse {
  id: string;
  storeId: string;
  categoryId: string;
  categoryName: string;
  status: 'active' | 'inactive';
  name: string;
  description?: string;
  image?: string;
  originalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuItemRequest {
  categoryId: string;
  name: string;
  description?: string;
  image?: string;
  originalPrice: number;
}

export interface UpdateMenuItemRequest {
  categoryId?: string;
  status?: 'active' | 'inactive';
  name?: string;
  description?: string;
  image?: string;
  originalPrice?: number;
}
```

Behavior:

- `GET /api/categories`는 공개 API이다.
- seller menu API는 `requireSellerStore()`를 통과해야 한다.
- `CreateMenuItemRequest.categoryId`는 필수이며, 존재하지 않는 category이면 `CATEGORY_NOT_FOUND` (404)를 반환한다.
- 상품 생성 시 `menuItemId`는 seller store 소유 menu item이어야 한다.
- 상품 생성 시 `menuItemId`는 `active` 상태여야 한다.
- `products.category_id`는 상품 생성 시 `menu_items.category_id`를 복사한다.
- `ProductResponse.originalPrice`는 `products.original_price` (등록 시점 snapshot)에서 가져온다. `menu_items.original_price`가 나중에 변경되어도 기존 상품의 원가는 소급 변경되지 않는다.
- 메뉴 이미지가 새 파일로 교체되는 경우 공통 file helper의 `seller_product_image` purpose를 사용한다.
- 메뉴 삭제는 물리 삭제보다 `status = inactive` 비활성화를 우선 검토한다.

소비자 공개 상품 조회 API이다.

| PRD ID    | 기능           | Method | API                          | Auth   | Priority |
| --------- | -------------- | ------ | ---------------------------- | ------ | -------- |
| C-PROD-01 | 상품 목록 조회 | GET    | `/api/products`              | public | P0       |
| C-PROD-02 | 상품 상세 조회 | GET    | `/api/products/:productId`   | public | P0       |
| C-PROD-03 | 지역 필터      | GET    | `/api/products?region=`      | public | P0       |
| C-PROD-04 | 카테고리 필터  | GET    | `/api/products?categoryId=`  | public | P0       |
| C-PROD-05 | 검색           | GET    | `/api/products?keyword=`     | public | P0       |
| C-PROD-06 | 정렬           | GET    | `/api/products?sort=&order=` | public | P2       |

### 4.1 `GET /api/products`

Query:

```ts
export interface ProductListParams {
  page: number;
  pageSize: number;
  region?: string;
  categoryId?: string;
  keyword?: string;
  sort?: 'endAt' | 'discountRate' | 'price' | 'createdAt';
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

- `originalPrice`는 `products.original_price` (등록 시점 snapshot)에서 가져온다.
- `availableStock`은 `products.available_stock` DB generated column (`stock - reserved_stock`)에서 가져온다.
- `discountRate`는 `products.discount_rate` DB generated column (`round((1 - discountPrice / originalPrice) * 100)`)에서 가져온다.
- `isSoldOut = availableStock <= 0`
- `isExpired = endAt <= now`
- `displayStatus`는 `status`, `isSoldOut`, `isExpired` 기준으로 계산한다.

Behavior:

- `region`은 `stores.region` 기준으로 필터링한다.
- `categoryId`는 `products.category_id` 기준으로 필터링한다.
- `keyword`는 상품명(`menu_items.name`) ILIKE 기준으로 필터링한다. 가게명(`stores.name`) 검색은 지원하지 않는다.
- `sort` 기본값은 `endAt`, `order` 기본값은 `asc`이다.

### 4.2 `GET /api/products/:productId`

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

## 5. Orders

| PRD ID     | 기능         | Method | API                           | Auth | Priority |
| ---------- | ------------ | ------ | ----------------------------- | ---- | -------- |
| C-ORDER-01 | 주문 생성    | POST   | `/api/orders`                 | user | P0       |
| C-MY-01    | 내 주문 목록 | GET    | `/api/orders`                 | user | P0       |
| C-MY-02    | 주문 상세    | GET    | `/api/orders/:orderId`        | user | P0       |
| C-ORDER-04 | 주문 취소    | PATCH  | `/api/orders/:orderId/cancel` | user | P1       |

### 5.1 `POST /api/orders`

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
- `orderNumber`, `orderName`, `paymentAmount`, `expiresAt`을 반환한다. 프론트는 이 값으로 `POST /api/payments/prepare`를 호출해 결제를 시작한다.

DB source:

- `orders`
- `order_items`
- `products`
- `menu_items`

### 5.2 `GET /api/orders`

Query:

```ts
export interface ConsumerOrderListParams {
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
  // 'accepted', 'processing' 제외 (소비자 필터 대상 아님)
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
    | 'processing'
    | 'reserved'
    | 'accepted'
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

### 5.3 `GET /api/orders/:orderId`

Response:

```ts
export interface OrderDetailResponse extends OrderListItemResponse {
  cancelledAt?: string;
  cancelReason?: string;
  pickedUpAt?: string;
  items: OrderItemResponse[];
  payment?: PaymentResponse;
}
```

- 주문자 본인만 조회할 수 있다.
- 판매자/관리자 조회는 별도 API를 사용한다.
- `payment` 필드는 결제가 완료된 주문에만 포함된다.

---

## 6. Payments

| PRD ID     | 기능         | Method | API                               | Auth       | Priority |
| ---------- | ------------ | ------ | --------------------------------- | ---------- | -------- |
| C-ORDER-03 | 결제 준비    | POST   | `/api/payments/prepare`           | user       | P0       |
| C-ORDER-03 | 결제 승인    | POST   | `/api/payments/confirm`           | user       | P0       |
| -          | 결제 Webhook | POST   | `/api/payments/webhook`           | external   | P1       |
| C-ORDER-04 | 결제 취소    | POST   | `/api/payments/:paymentId/cancel` | user/admin | P1       |

### 5.0 결제 구조

- PickMa 내부 주문 식별자는 `orderNumber`(`orders.order_number`)를 사용한다.
- PG: Toss Payments 단일 PG. 어댑터 패턴 없이 서버 내부에서 직접 연결한다.
- method: 사용자가 선택한 결제 수단 (`card | virtual_account | mobile | easy_pay`). Toss 응답 한국어 값을 서버에서 매핑한다.
- `PAYMENT_MOCK=true` 환경변수 설정 시 Toss API를 호출하지 않고 mock 결과를 반환한다. Toss 키 없이 로컬 개발이 가능하다.
- Toss Secret key(`TOSS_SECRET_KEY`)는 서버에서만 사용하며, client bundle에 노출하지 않는다.
- 결제 페이지: `/payment/toss-checkout` (Toss 결제창 진입), `/payment/success` (confirm 처리), `/payment/fail` (취소/실패 처리).
- webhook, cancel/refund는 P1 backlog.
- Toss의 `orderId`, KakaoPay의 `partner_order_id` 등 외부 필드명은 adapter 내부에서만 다룬다.
- 향후 KakaoPay/NaverPay 등 provider adapter를 추가할 경우 provider 값은 `toss | kakao_pay | naver_pay` 중 하나로 확장하고, provider Secret key는 서버 adapter 내부에서만 사용한다.
- KakaoPay/NaverPay adapter, webhook, cancel/refund는 Toss MVP adapter 구현 후 별도 phase 또는 Phase 11 운영 필수성 판단에서 승격 여부를 결정한다.

### 6.1 `POST /api/payments/prepare`

Request:

```ts
export interface PreparePaymentRequest {
  orderNumber: string;
  orderName: string;
}
```

Response:

```ts
export interface PreparePaymentResponse {
  redirectUrl: string;
  orderNumber: string;
  amount: number;
  expiresAt?: string;
}
```

Behavior:

- 요청 사용자가 해당 주문의 주문자인지 `orderNumber + userId` 기준으로 확인한다.
- 주문 상태가 `payment_pending`인지, 만료되지 않았는지 검증한다.
- `PAYMENT_MOCK=true`: `redirectUrl = /payment/success?paymentKey=mock_pk_...&orderId={orderNumber}&amount={amount}`
- `PAYMENT_MOCK` 미설정/`false`: `redirectUrl = /payment/toss-checkout?orderNumber=...&amount=...&orderName=...`
- 클라이언트는 `redirectUrl`을 팝업 창(`window.open`)으로 열어 결제 흐름을 진행한다.
- 향후 provider adapter로 확장해도 클라이언트 소비 방식(팝업)은 동일하게 유지한다.

### 6.2 `POST /api/payments/confirm`

Request:

```ts
export interface ConfirmPaymentRequest {
  paymentKey: string;
  orderNumber: string;
  amount: number;
}
```

Response: `200 { data: null }`

Behavior:

- 요청 사용자가 해당 주문의 주문자인지 확인한다.
- 주문 상태가 `payment_pending`인지 확인한다.
- `expiresAt`이 지난 주문은 Postgres RPC/transaction으로 `orders.status = expired` 처리와 `reserved_stock` 복구를 atomic하게 수행한 뒤 `ORDER_EXPIRED`를 반환한다.
- DB의 주문 금액과 `amount`가 일치하는지 검증한다.
- `PAYMENT_MOCK=true`: mock 결과를 바로 사용한다.
- `PAYMENT_MOCK` 미설정/`false`: Toss confirm API(`POST https://api.tosspayments.com/v1/payments/confirm`)를 서버에서 호출한다. Auth: `Basic base64(TOSS_SECRET_KEY:)`.
- 승인 후 `confirm_payment` DB RPC로 주문을 atomic하게 확정한다.
- 결제 확정 시 Postgres RPC/transaction으로 `orders.status = reserved`, `stock` 감소, `reserved_stock` 감소, 매장 운영 번호 발급을 atomic하게 처리한다.
- `storeOrderNumber`는 `pickupServiceDate(YYYYMMDD)` + `-` + 7자리 매장별/픽업일별 결제완료 sequence로 생성한다. 예: `20260501-0000001`.
- `pickupNumber`는 같은 sequence에서 `A-01`부터 `Z-99`까지 생성한다. 매장+픽업일 기준 2,574건을 초과하면 주문 확정 실패로 처리한다.
- 취소/환불/노쇼가 발생해도 이미 발급된 `storeOrderNumber`와 `pickupNumber`는 회수하거나 재사용하지 않는다.
- `payments` DB schema는 결제 기록과 주문 확정에 집중한다. 수수료/정산 필드는 후속 Settlement/Fee Policy phase 범위이다.
- `confirm_payment` RPC 실패 시 보상 정책(Option B): `PAYMENT_MOCK=false`이면 `callTossCancel`로 Toss 자동 취소를 시도하고, 성공 시 `revert_payment_processing`으로 주문을 `payment_pending`으로 복구한다. cancel 실패 또는 revert 실패 시 주문은 `processing` 잔류하며 운영 알람 대상이 된다(30분 기준). `PAYMENT_MOCK=true`이면 Toss cancel을 호출하지 않고 `revert_payment_processing`만 시도한다.

### 6.3 `PaymentResponse`

```ts
export interface PaymentResponse {
  id: string;
  orderId: string;
  orderNumber: string;
  method: PaymentMethod;
  methodDetail?: string;
  amount: number;
  status: PaymentStatus;
  paidAt?: string;
  refundedAt?: string;
  refundReason?: string;
  createdAt: string;
  updatedAt: string;
}
```

- `orderId`: 내부 주문 UUID (`orders.id`)
- `orderNumber`: PickMa 전역 주문번호 (`orders.order_number`)
- provider/providerPaymentKey/providerOrderId는 서버 내부 DB에만 저장되며 API 응답에는 포함하지 않는다.

### 6.4 결제 만료 처리

- 만료 대상은 `payment_pending` 주문만 해당한다.
- 초기 구현은 API 진입 시 lazy cleanup과 결제 confirm 시점 검사를 함께 사용한다.
- lazy cleanup은 상품/주문/결제 API 진입 시 만료된 `payment_pending` 주문을 `expired`로 변경하고 `reserved_stock`을 복구하는 RPC/transaction을 호출한다.
- 결제 confirm은 lazy cleanup과 별개로 반드시 `expiresAt`을 검사한다.
- scheduled job/cron 기반 정리는 MVP 이후 안정화 단계에서 추가한다.
- `confirm_payment` RPC 실패로 `processing` 잔류한 주문의 gap 처리는 6.2 Behavior의 Option B 보상 정책을 따른다.
- `processing` 상태로 30분 이상 잔류하는 주문은 운영 알람 대상이며 관리자가 수동으로 확인한다.
- outbox/webhook/idempotency 고도화는 T11 backlog으로 분리한다.

DB source:

- `orders`
- `payments`
- `products`

### 6.5 `POST /api/payments/webhook`

Toss가 호출하는 결제 상태 동기화 endpoint이다. 구현 우선순위: P1. 구현: T63. 설계 문서: `docs/payment_event_design.md`.

**허용 이벤트 타입**

| Toss eventType           | 처리 내용             |
| ------------------------ | --------------------- |
| `PAYMENT_STATUS_CHANGED` | 결제 상태 변화 동기화 |
| `DEPOSIT_CALLBACK`       | 가상계좌 입금 확인    |

허용 결제수단: `card`, `virtual_account`, `mobile`, `easy_pay`

**검증 방식**

Toss webhook body 구조 (이벤트별 상이):

- `PAYMENT_STATUS_CHANGED`: `{ eventType, createdAt, data: { paymentKey, orderId, totalAmount, status, ... } }` — 결제 정보는 `data` 안에 위치
- `DEPOSIT_CALLBACK`: `{ createdAt, secret, status, orderId, transactionKey }` — 필드가 루트에 위치

| eventType                | 검증 방법                                                                                           |
| ------------------------ | --------------------------------------------------------------------------------------------------- |
| `PAYMENT_STATUS_CHANGED` | HMAC 서명 없음. `body.data.orderId`(=orderNumber), `body.data.totalAmount`를 DB와 교차 검증 + HTTPS |
| `DEPOSIT_CALLBACK`       | `body.secret`을 `payments.pg_response.secret`과 비교. `body.orderId`(=orderNumber)로 대상 결제 조회 |

`TOSS_WEBHOOK_SECRET` 환경변수는 사용하지 않는다.

**Idempotency**

- `tosspayments-webhook-transmission-id` 헤더를 `payment_events.provider_event_id`에 저장한다.
- `(provider, provider_event_id)` unique index로 retry/중복 수신을 차단한다.
- 중복 수신 시 `200 OK` 반환 (멱등 처리).

**`DEPOSIT_CALLBACK` 검증을 위한 secret 저장**

Toss confirm 응답에서 최소 필드만 `payments.pg_response` jsonb에 저장한다: `paymentKey`, `orderId`, `method`, `status`, `secret`. 카드번호, 계좌번호, 고객 식별성이 높은 상세 정보는 저장하지 않는다.

**처리 흐름**

1. `provider_event_id` 중복 확인 → 중복이면 `200 OK`
2. `payment_webhook_received` 이벤트 INSERT (`status='pending'`)
3. 이벤트 타입별 처리
4. `status='processed'`, `processed_at=now()` 갱신

---

## 7. Seller Applications / Stores

| PRD ID     | 기능                        | Method | API                             | Auth   | Priority |
| ---------- | --------------------------- | ------ | ------------------------------- | ------ | -------- |
| S-STORE-01 | 판매자 신청                 | POST   | `/api/seller-applications`      | user   | P0       |
| S-STORE-03 | 판매자 onboarding 상태 조회 | GET    | `/api/seller/onboarding-status` | user   | P0       |
| S-STORE-01 | 가게 등록                   | POST   | `/api/stores`                   | seller | P0       |
| S-STORE-03 | 내 가게 상태 조회           | GET    | `/api/stores/me`                | user   | P0       |
| S-STORE-02 | 내 가게 정보 수정           | PATCH  | `/api/stores/me`                | seller | P1       |

### 7.1 `POST /api/seller-applications`

판매자 신청은 가게 등록과 분리한다. 신청자는 사업자 정보와 문서 3종을 제출하고, 관리자가 승인하면 `users.role`이 `seller`로 전환된다.

Request:

```ts
export interface CreateSellerApplicationRequest {
  businessNumber: string;
  companyName: string;
  representativeName: string;
  businessAddress: string;
  businessType: string;
  businessCategory: string;
  documentConsentAgreed: boolean; // true required
  documents: Array<{
    type: 'business_license' | 'food_service_permit' | 'bank_account';
    storagePath: string;
    originalFileName: string;
    contentType: string;
    size: number;
  }>;
}
```

Response:

```ts
export interface SellerApplicationResponse {
  id: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  businessNumber: string;
  companyName: string;
  representativeName: string;
  businessAddress: string;
  businessType: string;
  businessCategory: string;
  documentConsentAgreed: boolean;
  documentConsentAgreedAt?: string;
  rejectReason?: string;
  reviewedAt?: string;
  documents: SellerApplicationDocumentResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface SellerApplicationDocumentResponse {
  id: string;
  applicationId: string;
  type: 'business_license' | 'food_service_permit' | 'bank_account';
  storagePath: string;
  originalFileName: string;
  contentType: string;
  size: number;
  createdAt: string;
}
```

Behavior:

- 로그인 active user만 호출할 수 있다.
- 이미 `seller` role이면 신청할 수 없다.
- pending 또는 approved 신청이 있으면 신청할 수 없다.
- rejected 신청만 있으면 재신청할 수 있으며, 기존 row를 수정하지 않고 새 row를 생성한다.
- `business_license`, `food_service_permit`, `bank_account` 3종 문서가 모두 필요하다.
- 판매자 심사용 서류 수집·이용 동의(`documentConsentAgreed: true`)가 필요하며, 동의 시각은 신청 row에 저장한다.
- 문서 파일은 private bucket `seller-application-documents`에 업로드된 storage path여야 한다.
- 신청자 기본 정보(`email`, `name`, `phone`)는 `users`를 join해 조회하고, 신청서에는 사업자 정보 snapshot만 저장한다.

DB source:

- `seller_applications`
- `seller_application_documents`
- `users`

### 7.2 `GET /api/seller/onboarding-status`

Response:

```ts
export interface SellerOnboardingStatusResponse {
  role: 'customer' | 'seller' | 'admin';
  applicationStatus: 'none' | 'pending' | 'approved' | 'rejected';
  hasStore: boolean;
  latestRejectReason?: string;
}
```

Behavior:

- 로그인 active user만 호출할 수 있다.
- seller application 상태는 최신 신청 row 기준으로 반환한다.
- 신청 이력이 없으면 `applicationStatus = 'none'`으로 반환한다.
- `applicationStatus = 'approved'`인데 `users.role !== 'seller'`인 불일치 상태도 500으로 숨기지 않고 원시 상태 그대로 반환한다.
- `nextStep` 계산은 포함하지 않는다. seller 페이지에서 필요하면 후속으로 추가한다.

DB source:

- `users`
- `seller_applications`
- `stores`

### 7.3 `POST /api/stores`

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

- `seller` role 사용자만 호출할 수 있다.
- 로그인 사용자가 이미 가게를 가지고 있으면 실패한다.
- 생성된 가게 status는 `active`, operation_status는 `open`이다.
- DB unique 충돌(`user_id` 중복, `business_number` 중복 모두 포함)은 `STORE_ALREADY_EXISTS (409)`로 반환한다.
- 판매자 승인 전 사용자는 가게를 등록할 수 없다.

DB source:

- `stores`
- `users`

### 7.4 `GET /api/stores/me`

- 내 가게가 있으면 `StoreResponse`를 반환한다.
- 가게가 없으면 `STORE_NOT_FOUND (404)`를 반환하고, client API는 화면 분기를 위해 `null`로 변환할 수 있다.
- seller onboarding 상태 표현은 `/api/seller/onboarding-status` 책임이다.

### 7.5 `PATCH /api/stores/me`

- 권한: `seller` role, 본인 가게만 수정 가능
- Request: `UpdateStoreRequest` (최소 1개 필드 필요)
  - `name?`: string — 가게명
  - `description?`: string — 가게 소개
  - `phone?`: string — 연락처
  - `address?`: string — 주소
  - `addressDetail?`: string — 상세 주소
  - `region?`: string — 지역
  - `image?`: string — 이미지 URL
  - `openTime?`: string — 영업 시작 시간 (ISO time 형식, 저장 시 `HH:mm:ss`로 정규화)
  - `closeTime?`: string — 영업 종료 시간 (ISO time 형식, 저장 시 `HH:mm:ss`로 정규화)
  - `operationStatus?`: `'open' | 'closed'` — 판매자 운영 상태 토글. `status = 'inactive'` 가게는 변경 불가 (`STORE_INACTIVE 403`)
- Validation:
  - 필드 미제공 시 `VALIDATION_ERROR (400)`
  - 문자열 필드 trim 후 빈 문자열 불가
- Response: `200 { statusCode: 200, data: StoreResponse }`
- 정책: `businessNumber` 수정 불가

### 7.6 `GET /api/seller-applications/me`

판매자 본인의 최신 신청 정보와 제출 문서 목록을 조회한다.

| 기능                | Method | API                           | Auth   | Priority |
| ------------------- | ------ | ----------------------------- | ------ | -------- |
| 본인 신청 정보 조회 | GET    | `/api/seller-applications/me` | seller | P2       |

Auth 조건:

- `requireActiveUser()`를 통과한 로그인 사용자만 호출할 수 있다.

Response: `SellerApplicationResponse` (기존 7.1 참조)

Behavior:

- `seller_applications` 테이블을 `user_id = authUser.id` 조건으로 조회한다. service role client + `eq('user_id', userId)` 소유권 조건을 사용하며, 해당 테이블은 RLS enable 상태이나 authenticated 직접 접근을 막는 정책으로 운영된다.
- 최신 신청(`created_at DESC LIMIT 1`)을 반환하며, `seller_application_documents`를 함께 조회해 `documents` 배열에 포함한다.
- 신청 이력이 없으면 `SELLER_APPLICATION_NOT_FOUND (404)`를 반환한다.
- `SellerApplicationDocumentResponse.storagePath`는 응답에 포함되나, 클라이언트는 이 값으로 Storage에 직접 접근하지 않는다. 문서 미리보기는 반드시 아래 7.7 signed URL API를 경유한다.

에러 정책:

| 조건                      | HTTP | error code                     |
| ------------------------- | ---- | ------------------------------ |
| 미인증 또는 inactive user | 401  | `UNAUTHORIZED`                 |
| 신청 이력 없음            | 404  | `SELLER_APPLICATION_NOT_FOUND` |
| DB 조회 실패              | 500  | `INTERNAL_SERVER_ERROR`        |

---

### 7.7 `GET /api/seller-applications/me/documents/[documentId]`

판매자 본인의 제출 문서에 대한 단기 signed URL을 발급한다.

| 기능                 | Method | API                                                 | Auth   | Priority |
| -------------------- | ------ | --------------------------------------------------- | ------ | -------- |
| 문서 signed URL 발급 | GET    | `/api/seller-applications/me/documents/:documentId` | seller | P2       |

Auth 조건:

- `requireActiveUser()`를 통과한 로그인 사용자만 호출할 수 있다.
- 요청한 `documentId`가 본인 신청(`seller_applications.user_id = authUser.id`)에 속하는지 서버에서 검증한다.

Response:

```ts
export interface SellerApplicationDocumentReadUrlResponse {
  signedUrl: string;
}
```

Behavior:

- `seller_application_documents` 테이블에서 `documentId`로 문서를 조회한다.
- 해당 문서의 `application_id`로 `seller_applications`를 조회해 `user_id`가 요청자와 일치하는지 소유권을 검증한다.
- 소유권 검증 통과 후 Supabase Storage `seller-application-documents` bucket에서 `storage_path` 기준으로 signed URL을 발급한다. 만료 시간은 **5분**이다.
- 클라이언트는 signed URL만 받으며, `storagePath`로 Storage에 직접 접근하지 않는다.
- signed URL은 `image/jpeg`, `image/png`, `application/pdf` 문서 모두에 적용된다. 클라이언트는 `contentType` 기준으로 이미지(`image/*`)는 미리보기, PDF 등은 새 탭 열기로 분기한다.
- `staleTime`은 클라이언트 hook에서 4분으로 설정해 만료 전 갱신을 유도한다.

에러 정책:

| 조건                            | HTTP | error code                       |
| ------------------------------- | ---- | -------------------------------- |
| 미인증 또는 inactive user       | 401  | `UNAUTHORIZED`                   |
| documentId에 해당하는 문서 없음 | 404  | `APPLICATION_DOCUMENT_NOT_FOUND` |
| 문서가 본인 신청 소속이 아님    | 403  | `FORBIDDEN`                      |
| Storage signed URL 생성 실패    | 500  | `INTERNAL_SERVER_ERROR`          |

---

## 8. Seller Products

| PRD ID    | 기능         | Method | API                                     | Auth   | Priority |
| --------- | ------------ | ------ | --------------------------------------- | ------ | -------- |
| S-PROD-01 | 상품 등록    | POST   | `/api/seller/products`                  | seller | P0       |
| S-PROD-04 | 내 상품 목록 | GET    | `/api/seller/products`                  | seller | P0       |
| S-PROD-02 | 상품 수정    | PATCH  | `/api/seller/products/:productId`       | seller | P0       |
| S-PROD-03 | 상품 삭제    | DELETE | `/api/seller/products/:productId`       | seller | P0       |
| S-PROD-05 | 재고 관리    | PATCH  | `/api/seller/products/:productId/stock` | seller | P1       |

Seller product API는 `requireSellerStore()`를 통과해야 한다. 특정 상품이 해당 seller의 store 소유인지 service에서 최종 검증한다.

### 8.1 Seller Product Contract

`GET /api/seller/products`

- Request: query 없음. pagination, sort, filter는 후속 seller product 화면 요구가 확정되면 추가한다.
- Response: `200 { statusCode: 200, data: ProductListItemResponse[] }`
- 정책: 승인된 seller의 `store.id`와 일치하는 상품만 반환한다.

`POST /api/seller/products`

- Request: `CreateSellerProductRequest`
  - `menuItemId`: 기존 menu item id
  - `discountPrice`: 0 이상의 정수
  - `stock`: 0 이상의 정수
  - `endAt`: ISO datetime string
  - `pickupStartTime`, `pickupEndTime`: `HH:mm` 또는 `HH:mm:ss` time string
- Response: `201 { statusCode: 201, data: ProductListItemResponse }`
- 정책: `menuItemId`는 seller store 소유이고 `active` 상태여야 하며, product `category_id`는 menu item의 `category_id`를 복사한다.

`PATCH /api/seller/products/:productId`

- Request: `UpdateSellerProductRequest`, 최소 1개 필드 필요
- Response: `200 { statusCode: 200, data: ProductListItemResponse }`
- 정책: product는 seller store 소유여야 한다. `stock` 수정 시 기존 `reserved_stock`보다 작게 저장할 수 없다.

`DELETE /api/seller/products/:productId`

- Response: `200 { statusCode: 200, data: null }`
- 정책: row를 삭제하지 않고 `products.status = 'closed'`로 변경한다.

Seller product API의 pickup time은 서버 schema에서 `HH:mm:ss`로 정규화해 저장한다. 소유하지 않은 product 접근은 `PRODUCT_NOT_FOUND`(404)로 반환한다. 상품 생성 시 menu item이 없으면 `MENU_ITEM_NOT_FOUND`(404), 판매 중지(`inactive`) 상태이면 `MENU_ITEM_INACTIVE`(409)를 반환한다.

---

## 9. Seller Orders

| PRD ID     | 기능           | Method | API                                    | Auth   | Priority |
| ---------- | -------------- | ------ | -------------------------------------- | ------ | -------- |
| S-ORDER-01 | 주문 목록 조회 | GET    | `/api/seller/orders`                   | seller | P0       |
| S-ORDER-02 | 주문 상세 조회 | GET    | `/api/seller/orders/:orderId`          | seller | P0       |
| S-ORDER-05 | 접수 처리      | PATCH  | `/api/seller/orders/:orderId/accept`   | seller | P0       |
| S-ORDER-06 | 준비 완료 처리 | PATCH  | `/api/seller/orders/:orderId/ready`    | seller | P0       |
| S-ORDER-03 | 픽업 완료 처리 | PATCH  | `/api/seller/orders/:orderId/complete` | seller | P0       |
| S-ORDER-04 | 노쇼 처리      | PATCH  | `/api/seller/orders/:orderId/no-show`  | seller | P1       |

Seller order API는 `requireSellerStore()`를 통과해야 하며, 해당 주문이 seller의 store에 속하는지 검증한다.

### 9.1 상태 전이 정책

```

reserved → (PATCH /accept) → accepted → (PATCH /ready) → ready → (PATCH /complete) → completed

```

- accept 허용 상태: `reserved`
- ready 허용 상태: `accepted`
- complete 허용 상태: `ready`
- 허용되지 않는 현재 상태에서 전이 시도 → `INVALID_ORDER_STATUS` 409
- 상태 전이는 update query에 `store_id`, `orderId`, `expectedStatus` 조건을 모두 포함해 원자적으로 수행한다.
- `complete` 처리 시 `picked_up_at = now()` 함께 기록한다.
- MVP에서 `ready` 전이는 cron/자동이 아닌 seller 수동 처리다.
- 응답: `void` (`success(undefined)`)

### 9.2 목록 query (SellerOrderListParams)

```ts
export interface SellerOrderListParams {
  page: number;
  pageSize: number;
  status?:
    | 'reserved'
    | 'accepted'
    | 'ready'
    | 'completed'
    | 'cancelled'
    | 'no_show'
    | 'expired';
  // 'payment_pending', 'processing' 제외
  sort: 'createdAt' | 'pickupAt';
  order: 'asc' | 'desc';
}
```

- 오류: `ORDER_NOT_FOUND` 404 (orderId 불일치 또는 타 store 주문), `INVALID_ORDER_STATUS` 409

---

## 10. Admin

Admin API는 `/api/admin/*`로 분리한다. 모든 Admin API는 `requireAdmin()`을 통과해야 한다.

### 10.1 Seller Applications

| 기능                       | Method | API                                                    | Priority |
| -------------------------- | ------ | ------------------------------------------------------ | -------- |
| 승인 대기 판매자 신청 목록 | GET    | `/api/admin/sellers/pending`                           | P0       |
| 판매자 신청 승인           | POST   | `/api/admin/sellers/:applicationId/approve`            | P0       |
| 판매자 신청 거절           | POST   | `/api/admin/sellers/:applicationId/reject`             | P0       |
| 첨부 파일 signed URL 발급  | POST   | `/api/admin/seller-application-documents/:id/read-url` | P0       |

- `/api/admin/sellers/:applicationId/*`의 `:applicationId`는 seller application id이다.
- `/api/admin/seller-application-documents/:id/read-url`의 `:id`는 seller application document id이다.

`GET /api/admin/sellers/pending`은 pending 신청만 반환한다. Query는 `page`, `pageSize`, `keyword`, `createdDate`, `businessCategory`를 지원하며, `totalCount`와 `totalPages`는 적용된 검색/필터 조건 기준으로 반환한다. 승인 완료/거절 이력을 포함한 전체 심사 이력 조회는 후속 `/api/admin/seller-applications` 같은 별도 API로 검토한다.

승인 처리:

- `seller_applications.status = 'approved'`
- `seller_applications.reviewed_at = now()`
- `users.role = 'seller'`
- 위 변경은 Postgres RPC 또는 transaction으로 atomic하게 처리한다.

거절 처리:

- `seller_applications.status = 'rejected'`
- `reject_reason` 저장
- `reviewed_at = now()`
- `users.role`은 변경하지 않는다.

`reviewed_by`는 `seller_applications`에 저장하지 않는다. 관리자 작업자 추적은 후속 감사 로그 도메인에서 검토한다.

첨부 파일 조회:

- 관리자 UI가 첨부 파일 보기/다운로드를 요청하면 서버는 `requireAdmin()` 확인 후 짧은 만료 시간의 signed read URL을 발급한다.
- seller application 문서 bucket은 private이며 public URL을 사용하지 않는다.

### 10.2 Stores

| PRD ID     | 기능           | Method | API                                 | Priority |
| ---------- | -------------- | ------ | ----------------------------------- | -------- |
| A-STORE-04 | 전체 가게 조회 | GET    | `/api/admin/stores`                 | P0       |
| A-STORE-05 | 가게 상태 변경 | PATCH  | `/api/admin/stores/:storeId/status` | P1       |

가게 승인/거절 API는 신규 실행 범위가 아니다. 가게는 seller 승인 후 등록 시 `active` 상태로 생성한다.

`GET /api/admin/stores` query:

- `page`: positive integer, default `1`
- `pageSize`: positive integer, max `100`, default `20`
- `keyword`: optional string, 가게명/사업자번호/연락처/주소 검색
- `status`: optional `active | inactive`
- `region`: optional string, 지역 검색

응답은 공통 `PaginatedResult<AdminStoreResponse>` envelope를 사용하며, 모든 요청은 `requireAdmin()`을 통과해야 한다.

### 10.3 Users

| PRD ID    | 기능             | Method | API                               | Priority |
| --------- | ---------------- | ------ | --------------------------------- | -------- |
| A-USER-01 | 사용자 목록 조회 | GET    | `/api/admin/users`                | P1       |
| A-USER-02 | 사용자 상태 변경 | PATCH  | `/api/admin/users/:userId/status` | P1       |

`GET /api/admin/users` query:

- `page`: positive integer, default `1`
- `pageSize`: positive integer, max `100`, default `20`
- `keyword`: optional string, 이름/이메일/연락처 검색
- `role`: optional `customer | seller | admin`
- `status`: optional `active | suspended | deleted`

응답은 공통 `PaginatedResult<AdminUserResponse>` envelope를 사용하며, 모든 요청은 `requireAdmin()`을 통과해야 한다.

사용자 상태 변경 API는 T57 범위에서 운영 UI에 노출하지 않는다. 실제 정지/활성화 정책과 audit logging 기준 확정 후 별도 구현한다.

### 10.4 Products / Orders

| PRD ID     | 기능           | Method | API                   | Priority |
| ---------- | -------------- | ------ | --------------------- | -------- |
| A-PROD-01  | 전체 상품 조회 | GET    | `/api/admin/products` | P1       |
| A-ORDER-01 | 전체 주문 조회 | GET    | `/api/admin/orders`   | P1       |

A-ORDER-01은 `status=processing` filter를 지원한다. `processing` 잔류 주문 운영 확인(30분 알람 기준)에 사용된다.

`GET /api/admin/products` query:

- `page`: positive integer, default `1`
- `pageSize`: positive integer, max `100`, default `20`
- `keyword`: optional string, 상품명/가게명 검색
- `status`: optional `active | closed`
- `storeId`: optional uuid

응답은 공통 `PaginatedResult<AdminProductResponse>` envelope를 사용하며, 모든 요청은 `requireAdmin()`을 통과해야 한다.

`GET /api/admin/orders` query:

- `page`: positive integer, default `1`
- `pageSize`: positive integer, max `100`, default `20`
- `keyword`: optional string, 주문번호/매장별 주문번호/픽업번호/가게명 검색
- `status`: optional `payment_pending | processing | reserved | accepted | ready | completed | cancelled | no_show | expired`
- `sort`: optional `createdAt | pickupAt`, default `createdAt`
- `order`: optional `asc | desc`, default `desc`

응답은 공통 `PaginatedResult<AdminOrderResponse>` envelope를 사용하며, 모든 요청은 `requireAdmin()`을 통과해야 한다.

### 10.5 Dashboard

| PRD ID    | 기능        | Method | API                          | Priority |
| --------- | ----------- | ------ | ---------------------------- | -------- |
| A-DASH-01 | 플랫폼 통계 | GET    | `/api/admin/dashboard/stats` | P1       |
| A-DASH-02 | 일별 현황   | GET    | `/api/admin/dashboard/daily` | P2       |

`GET /api/admin/dashboard/stats`는 `requireAdmin()`을 통과한 관리자에게만 플랫폼 summary count를 반환한다. 응답은 공통 envelope의 `data`에 아래 필드를 포함한다.

- `totalStores`: 전체 가게 수
- `totalProducts`: 전체 상품 수 (`menu_items` 기준)
- `totalOrders`: 전체 주문 수
- `totalUsers`: 전체 사용자 수
- `dailyMetrics`: 최근 7일 주문 수와 매출액. `reserved`, `accepted`, `ready`, `completed`, `no_show` 상태만 집계하며 `payment_pending`, `processing`, `cancelled`, `expired`는 제외한다.
- `recentPendingApplications`: 최근 승인 대기 판매자 신청
- `recentOrders`: 최근 주문 내역
- `recentUsers`: 최근 가입 사용자

---

## 11. Wishlist

| PRD ID  | 기능         | Method | API                      | Auth | Priority |
| ------- | ------------ | ------ | ------------------------ | ---- | -------- |
| C-MY-04 | 찜 목록 조회 | GET    | `/api/wishlist`          | user | P2       |
| C-MY-04 | 찜 추가      | POST   | `/api/wishlist`          | user | P2       |
| C-MY-04 | 찜 삭제      | DELETE | `/api/wishlist/:storeId` | user | P2       |

Wishlist는 MVP 이후 기능으로 둔다.

---

## 12. Error Code 초기 목록

초기 에러 코드는 `src/lib/errors`에서 중앙 관리한다.

### RPC 내부 예외 매핑 정책

RPC에서 raise하는 예외는 아래 정책으로 API error code로 변환한다.

| RPC 예외                      | API 변환                         | 발생 RPC                                                                                                                              |
| ----------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `EMPTY_ITEMS`                 | `VALIDATION_ERROR` 400           | `create_order`                                                                                                                        |
| `INVALID_ITEM_FORMAT`         | `VALIDATION_ERROR` 400           | `create_order`                                                                                                                        |
| `INVALID_PICKUP_TIME`         | `VALIDATION_ERROR` 400           | `create_order`                                                                                                                        |
| `MULTIPLE_STORES_NOT_ALLOWED` | `VALIDATION_ERROR` 400           | `create_order`                                                                                                                        |
| `PRODUCT_NOT_FOUND`           | `PRODUCT_NOT_FOUND` 404          | `create_order`                                                                                                                        |
| `PRODUCT_EXPIRED`             | `PRODUCT_EXPIRED` 409            | `create_order`                                                                                                                        |
| `PRODUCT_NOT_AVAILABLE`       | `PRODUCT_NOT_AVAILABLE` 409      | `create_order`                                                                                                                        |
| `OUT_OF_STOCK`                | `OUT_OF_STOCK` 409               | `create_order`                                                                                                                        |
| `DUPLICATE_PRODUCT_IN_ORDER`  | `DUPLICATE_PRODUCT_IN_ORDER` 400 | `create_order`                                                                                                                        |
| `ORDER_NUMBER_EXHAUSTED`      | `ORDER_NUMBER_EXHAUSTED` 503     | `create_order`                                                                                                                        |
| `ORDER_NOT_FOUND`             | `ORDER_NOT_FOUND` 404            | `check_pickup_capacity`, `confirm_payment`, `expire_order`, `accept_seller_order`, `mark_seller_order_ready`, `complete_seller_order` |
| `ORDER_EXPIRED`               | `ORDER_EXPIRED` 409              | `confirm_payment`                                                                                                                     |
| `PAYMENT_AMOUNT_MISMATCH`     | `PAYMENT_AMOUNT_MISMATCH` 400    | `confirm_payment`                                                                                                                     |
| `PICKUP_NUMBER_EXHAUSTED`     | `PICKUP_NUMBER_EXHAUSTED` 409    | `confirm_payment`                                                                                                                     |
| `INVALID_ORDER_STATUS`        | `INVALID_ORDER_STATUS` 409       | `confirm_payment`, `expire_order`, `accept_seller_order`, `mark_seller_order_ready`, `complete_seller_order`                          |
| `ORDER_NOT_EXPIRED`           | `VALIDATION_ERROR` 400           | `expire_order`                                                                                                                        |
| `NOT_IMPLEMENTED`             | `NOT_IMPLEMENTED` 501            | `cancel_order`                                                                                                                        |
| `APPLICATION_NOT_PENDING`     | `VALIDATION_ERROR` 400           | `approve_seller_application`                                                                                                          |

`create_order`의 validation 예외는 Zod 스키마 검증이 선행되므로 정상 흐름에서는 도달하지 않아야 한다.

`create_seller_application`의 unique index 충돌(`23505`)은 race condition 시 `APPLICATION_ALREADY_SUBMITTED` 409로 매핑된다.

| Code                                    | HTTP | 메시지                                                         |
| --------------------------------------- | ---- | -------------------------------------------------------------- |
| `UNAUTHORIZED`                          | 401  | 로그인이 필요합니다.                                           |
| `FORBIDDEN`                             | 403  | 접근 권한이 없습니다.                                          |
| `VALIDATION_ERROR`                      | 400  | 요청 값이 올바르지 않습니다.                                   |
| `NOT_FOUND`                             | 404  | 요청한 리소스를 찾을 수 없습니다.                              |
| `PRODUCT_NOT_FOUND`                     | 404  | 상품을 찾을 수 없습니다.                                       |
| `ORDER_NOT_FOUND`                       | 404  | 주문을 찾을 수 없습니다.                                       |
| `STORE_NOT_FOUND`                       | 404  | 가게를 찾을 수 없습니다.                                       |
| `CATEGORY_NOT_FOUND`                    | 404  | 카테고리를 찾을 수 없습니다.                                   |
| `MENU_ITEM_NOT_FOUND`                   | 404  | 메뉴 아이템을 찾을 수 없습니다.                                |
| `MENU_ITEM_INACTIVE`                    | 409  | 판매 중지된 메뉴 아이템입니다.                                 |
| `STORE_INACTIVE`                        | 403  | 비활성화된 가게입니다.                                         |
| `STORE_ALREADY_EXISTS`                  | 409  | 이미 등록된 가게가 있습니다.                                   |
| `SELLER_APPLICATION_NOT_FOUND`          | 404  | 판매자 신청을 찾을 수 없습니다.                                |
| `APPLICATION_ALREADY_SUBMITTED`         | 409  | 진행 중이거나 승인된 판매자 신청이 있습니다.                   |
| `SELLER_ALREADY_REGISTERED`             | 409  | 이미 판매자로 등록되어 있습니다.                               |
| `APPLICATION_DOCUMENT_NOT_FOUND`        | 404  | 신청 서류를 찾을 수 없습니다.                                  |
| `FILE_UPLOAD_NOT_ALLOWED`               | 403  | 파일을 업로드할 권한이 없습니다.                               |
| `FILE_TYPE_NOT_ALLOWED`                 | 400  | 허용되지 않는 파일 형식입니다.                                 |
| `FILE_TOO_LARGE`                        | 400  | 파일 용량이 너무 큽니다.                                       |
| `AUTH_IDENTITY_CONFLICT`                | 409  | 이미 다른 로그인 방식으로 가입된 이메일입니다.                 |
| `AUTH_EMAIL_ALREADY_EXISTS`             | 409  | 이미 가입된 이메일입니다. 로그인해 주세요.                     |
| `AUTH_EMAIL_OTP_EXPIRED`                | 400  | 인증 코드가 만료되었습니다. 다시 요청해 주세요.                |
| `AUTH_EMAIL_OTP_INVALID`                | 400  | 인증 코드가 올바르지 않습니다.                                 |
| `AUTH_EMAIL_OTP_ATTEMPT_LIMIT_EXCEEDED` | 429  | 인증 시도 횟수를 초과했습니다. 다시 요청해 주세요.             |
| `AUTH_EMAIL_VERIFICATION_TOKEN_EXPIRED` | 400  | 이메일 인증이 만료되었습니다. 다시 인증해 주세요.              |
| `AUTH_EMAIL_VERIFICATION_TOKEN_INVALID` | 400  | 이메일 인증이 유효하지 않습니다. 다시 인증해 주세요.           |
| `AUTH_EMAIL_SIGNUP_IN_PROGRESS`         | 409  | 회원가입 요청을 처리 중입니다. 잠시 후 다시 시도해 주세요.     |
| `RATE_LIMIT_EXCEEDED`                   | 429  | 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.              |
| `AUTH_EMAIL_SEND_FAILED`                | 502  | 인증 메일을 발송하지 못했습니다. 잠시 후 다시 시도해 주세요.   |
| `AUTH_EMAIL_STORE_UNAVAILABLE`          | 503  | 이메일 인증을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요. |
| `OUT_OF_STOCK`                          | 409  | 재고가 부족합니다.                                             |
| `PRODUCT_EXPIRED`                       | 409  | 판매가 마감된 상품입니다.                                      |
| `PRODUCT_NOT_AVAILABLE`                 | 409  | 구매할 수 없는 상품입니다.                                     |
| `INVALID_ORDER_STATUS`                  | 409  | 현재 주문 상태에서는 진행할 수 없습니다.                       |
| `ORDER_EXPIRED`                         | 409  | 결제 가능 시간이 만료되었습니다.                               |
| `DUPLICATE_PRODUCT_IN_ORDER`            | 400  | 주문 항목에 중복된 상품이 있습니다.                            |
| `PAYMENT_AMOUNT_MISMATCH`               | 400  | 결제 금액이 일치하지 않습니다.                                 |
| `PAYMENT_CONFIRM_FAILED`                | 502  | 결제 승인에 실패했습니다.                                      |
| `PAYMENT_ALREADY_CONFIRMED`             | 409  | 이미 완료된 결제입니다.                                        |
| `ORDER_NUMBER_EXHAUSTED`                | 503  | 주문번호가 모두 소진되었습니다.                                |
| `PICKUP_NUMBER_EXHAUSTED`               | 409  | 픽업 번호가 모두 소진되었습니다.                               |
| `NOT_IMPLEMENTED`                       | 501  | 아직 구현되지 않은 API입니다.                                  |
| `INTERNAL_SERVER_ERROR`                 | 500  | 서버 오류가 발생했습니다.                                      |

---

## 13. 미구현(501) Endpoint 현황

`API_MOCK_ENABLED=false`에서 `NOT_IMPLEMENTED` 501을 반환하는 endpoint 목록이다.
각 endpoint의 실제 구현은 담당 task에서 진행하며, 담당 task 완료 기준에 `NOT_IMPLEMENTED` 반환 코드 제거가 포함된다.

| endpoint                                | method | real mode | mock mode | UI 연결 여부           | 운영 노출 위험 | 담당 task |
| --------------------------------------- | ------ | --------- | --------- | ---------------------- | -------------- | --------- |
| `PATCH /api/orders/{orderId}/cancel`    | PATCH  | 501       | 성공      | hook 정의됨, UI 미연결 | 낮음           | T31       |
| `POST /api/payments/{paymentId}/cancel` | POST   | 501       | 성공      | hook 정의됨, UI 미연결 | 낮음           | T31       |

### 501 연결 액션 운영 노출 정책

- real mode에서 501을 반환하는 endpoint에 연결된 버튼/링크는 활성 상태로 운영 UI에 노출하지 않는다.
- 후속 task 범위 기능은 숨김 또는 disabled 처리하고, 필요한 경우 "준비 중" 또는 명확한 disabled reason을 제공한다.
- mock mode에서만 성공하는 액션은 real mode 노출 여부를 별도 확인한다.
- placeholder 페이지가 API를 직접 호출하지 않는 경우는 운영 노출 위험 없음으로 기록한다.

### 현황 수동 검증

`rg "NOT_IMPLEMENTED" src/app/api` 결과가 위 목록(`_lib/response.ts` 정의 파일 제외)과 일치하는지 확인한다.
