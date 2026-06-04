# Domain Type & Contract DTO 가이드

## 1. 목적

이 문서는 PickMa의 DB row, API contract DTO, Domain type, mapper의 경계를 정의한다.

- DB 구조와 앱 내부 모델을 분리한다.
- HTTP로 오가는 값은 JSON-safe contract DTO로 정의한다.
- UI와 비즈니스 로직은 Domain type을 사용한다.
- 계층 간 변환 책임을 mapper에 둔다.

---

## 2. 데이터 모델 계층

```text
Supabase Row / Join Result
  ↓ server mapper
Contract DTO
  ↓ Response.json()
Contract DTO
  ↓ client mapper
Domain Type
  ↓ hook / component / business logic
```

| 계층          | 위치                                     | 역할                                            |
| ------------- | ---------------------------------------- | ----------------------------------------------- |
| Supabase Row  | `src/lib/supabase/database.ts`           | Supabase 자동 생성 타입                         |
| Contract DTO  | `src/contracts/*`                        | 서버와 클라이언트가 공유하는 JSON-safe API 계약 |
| Domain Type   | `src/types/*`                            | 앱 내부에서 사용하는 해석된 모델                |
| Server Mapper | `src/app/api/{resource}/_lib/mapper.ts`  | Supabase 결과를 Contract DTO로 변환             |
| Client Mapper | `src/api/{resource}/{resource}Mapper.ts` | Contract DTO를 Domain Type으로 변환             |

---

## 3. 디렉토리 역할

```text
src/contracts/
  common.ts
  auth.ts
  product.ts
  order.ts
  payment.ts
  store.ts
  user.ts
  admin.ts
  index.ts

src/types/
  auth.ts
  product.ts
  order.ts
  payment.ts
  store.ts
  user.ts
  index.ts

src/api/products/
  productApi.ts
  productMapper.ts

src/app/api/products/
  route.ts
  [productId]/
    route.ts
  _lib/
    service.ts
    mapper.ts
    schemas.ts
```

### `src/contracts`

- HTTP request/response DTO를 둔다.
- HTTP query/body parameter 타입도 API contract이므로 `src/contracts`에 둔다.
- API envelope, pagination 같은 공통 contract도 둔다.
- 날짜는 ISO string으로 표현한다.
- camelCase를 사용한다.
- DB 컬럼명과 1:1 대응을 강제하지 않는다.
- 예: `ProductListParams`, `CreateOrderRequest`, `ProductListResponse`
- 공통 export 정리를 위해 `src/contracts/index.ts` barrel은 허용한다.

### `src/types`

- 앱 내부 Domain type을 둔다.
- 화면 전용 filter/form state 타입은 API request 타입과 분리해 필요할 때만 둔다.
- UI와 비즈니스 로직이 바로 쓰기 좋은 형태로 정의한다.
- 날짜는 `Date`를 사용할 수 있다.
- 계산된 값과 파생 상태를 포함할 수 있다.
- Supabase CLI 생성 타입(`Database`)은 `src/lib/supabase/database.ts`에 둔다.
- `src/lib/supabase/database.ts`는 직접 수정하지 않는 generated file로 취급한다.
- Supabase DB 타입은 `src/app/api/**`, `src/lib/supabase/**` 같은 서버/DB 경계에서만 참조하고, hook/component/client API로 노출하지 않는다.
- 공통 export 정리를 위해 `src/types/index.ts` barrel은 허용한다.

---

## 4. 날짜 정책

HTTP JSON 응답은 `Date` 객체를 보존하지 못한다. 따라서 날짜는 계층별로 다르게 다룬다.

```text
Contract DTO: ISO string
Domain Type: Date
```

예:

```ts
// src/contracts/product.ts
export interface ProductResponse {
  id: string;
  endAt: string;
  createdAt: string;
}
```

```ts
// src/types/product.ts
export interface Product {
  id: string;
  endAt: Date;
  createdAt: Date;
}
```

```ts
// src/api/products/productMapper.ts
export function toProduct(response: ProductResponse): Product {
  return {
    ...response,
    endAt: new Date(response.endAt),
    createdAt: new Date(response.createdAt),
  };
}
```

---

## 5. 네이밍 정책

- API request/response 필드는 Domain 기준 camelCase를 사용한다.
- DB snake_case는 server service/mapper 내부에서만 다룬다.
- query parameter도 camelCase를 사용한다.
- API 요청 타입을 화면 filter state로 그대로 재사용하지 않는다. 화면 상태와 API 요청 형식이 우연히 같더라도 mapper 또는 변환 함수를 경계에 둔다.

예:

```text
GET /api/products?categoryId=...&sort=endAt&order=asc
```

```text
categoryId -> category_id
endAt -> end_at
```

---

## 6. 상태값 정책

DB, API contract, Domain의 상태값은 다를 수 있다.

```text
DB status
  ↓ mapper
API status / derived fields
  ↓ client mapper
Domain status / derived fields
```

원칙:

- 불필요하게 다르게 만들지 않는다.
- 1:1 대응을 강제하지 않는다.
- DB에는 저장 상태만 둔다.
- Domain에는 계산된 상태를 포함할 수 있다.
- API에 노출되는 status 값은 `api_spec.md`의 contract 기준을 따른다.

예:

```ts
export interface Product {
  status: ProductStatus;
  availableStock: number;
  isSoldOut: boolean;
  isExpired: boolean;
}
```

`isSoldOut`, `isExpired`는 DB에 저장하지 않고 mapper에서 계산할 수 있다.

---

## 7. 도메인 경계

### Auth / User

- Auth는 로그인 상태와 Supabase Auth user 식별을 담당한다.
- User는 PickMa 서비스 내부 사용자 정보를 담당한다.
- OAuth 로그인, email/password 로그인, 비밀번호 재설정, 로그아웃은 Supabase Auth SDK 래퍼에서 처리한다.
- email/password **회원가입**은 가입 전 이메일 선인증 Route Handler(`/api/auth/email-verifications/request`, `/api/auth/email-verifications/verify`, `/api/auth/email-signup`)를 통해 처리한다. `authApi.signUpWithEmail()`은 사용하지 않는다.
- Auth Domain Type은 `src/types/auth.ts`에 두고, `AuthProvider`, `AuthUser`, `AuthSession`, `AuthResult`만 앱에 노출한다. Supabase `Session`, `User`, `access_token`은 hook/component로 직접 노출하지 않는다.
- `src/contracts/auth.ts`에는 두 가지 종류의 contract가 공존한다:
  1. `authApi` 입력 contract (`SignInWithEmailRequest`, `ResetPasswordRequest`, `UpdatePasswordRequest`) — Supabase Auth SDK 래퍼 입력용
  2. 이메일 선인증 Route Handler contract (`RequestEmailVerificationRequest/Response`, `VerifyEmailOtpRequest/Response`, `CompleteEmailSignupRequest`) — `/api/auth/*` Route Handler 입출력용
- verification token은 클라이언트 React local state에만 보관한다. Zustand store, localStorage, sessionStorage, URL query에는 저장하지 않는다.
- 서비스 사용자 조회/수정/탈퇴는 `/api/users/me`에서 처리한다.

이메일 선인증 OTP 상태 저장소 인터페이스:

- `EmailVerificationStore` interface는 `src/app/api/auth/_lib/email-verification-store.ts`에 둔다.
- 운영 구현체는 `UpstashEmailVerificationStore` (`src/app/api/auth/_lib/upstash-email-verification-store.ts`)이다.
- service와 Route Handler는 interface에만 의존한다. 구현체 교체 시 Route Handler/service 변경이 없다.
- OTP challenge 상태값: `pending | sent | send_failed | superseded | verified | signup_in_progress | consumed`
- verification token 상태값: `verified | signup_in_progress | consumed`
- Redis는 TTL 기반 cleanup만 사용하며 별도 cron cleanup은 만들지 않는다.

### Catalog

```text
Catalog
  ├─ Category
  ├─ MenuItem
  └─ Product
```

- `MenuItem`: 판매자가 등록하는 정적 메뉴
- `Product`: 특정 시점에 판매되는 실제 판매 단위

### Order / Payment

```text
Order
  ├─ Order
  ├─ OrderItem
  └─ Payment
```

- 주문 생성과 결제 승인은 분리한다.
- `POST /api/orders`는 주문과 재고 임시 예약을 만든다.
- `POST /api/payments/prepare`는 `PAYMENT_MOCK` 환경변수에 따라 mock redirectUrl 또는 Toss checkout URL을 반환한다.
- `POST /api/payments/confirm`은 Toss confirm API(`toss.ts`)를 서버에서 직접 호출한 후 `confirm_payment` DB RPC로 주문을 확정한다.

---

## 8. 공통 Contract 타입

```ts
export interface ApiSuccess<T> {
  statusCode: number;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  error: {
    code: ErrorCode;
    message: string;
    details?: ValidationIssue[];
  };
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ValidationIssue {
  path: string;
  message: string;
}
```

`apiClient.get<T>()`의 `T`는 envelope 전체가 아니라 `data`의 타입이다.

---

## 9. Mapper 원칙

### Server Mapper

```text
Supabase Row / Join Result -> Contract DTO
```

- snake_case를 camelCase로 변환한다.
- join 결과에서 API에 필요한 값만 추출한다.
- API 응답에 필요한 계산값을 만든다.
- 날짜는 ISO string으로 반환한다.
- 기본 위치: `src/app/api/{resource}/_lib/mapper.ts`.
- 둘 이상의 resource가 같은 row → contract mapper를 공유해야 하면 `src/app/api/_lib/*-mapper.ts`에 둔다. resource-local mapper는 공통 mapper를 re-export할 수 있다.

### Client Mapper

```text
Contract DTO -> Domain Type
```

- ISO string을 `Date`로 변환한다.
- Domain에서 필요한 파생값을 보강할 수 있다.
- hook/component는 DTO를 직접 사용하지 않는다.

---

## 10. Request 검증

- request query/body 검증은 Zod를 사용한다.
- Request/Response 타입의 기준은 `src/contracts`에 둔다.
- Zod schema는 contracts 타입을 만족하도록 작성한다.
- schema는 Route Handler 가까이에 둔다.

예:

```ts
export const productListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['endAt', 'discountRate', 'createdAt']).default('endAt'),
  order: z.enum(['asc', 'desc']).default('asc'),
  categoryId: z.string().uuid().optional(),
}) satisfies z.ZodType<ProductListParams>;
```

검증 실패는 `VALIDATION_ERROR`로 변환하며 field별 `details`를 포함한다.

---

## 11. Domain Type 작성 방향

- 화면 기준이 아니라 도메인 기준으로 묶는다.
- DB 구조를 그대로 노출하지 않는다.
- UI에서 반복 계산하지 않도록 의미 있는 파생값을 제공한다.
- 화면 전용 조합이 필요하면 Domain 기반 View Model을 별도로 둘 수 있다.

예:

```ts
export interface ProductListItem {
  id: string;
  name: string;
  storeName: string;
  originalPrice: number;
  discountPrice: number;
  discountRate: number;
  endAt: Date;
  availableStock: number;
  isSoldOut: boolean;
}
```
