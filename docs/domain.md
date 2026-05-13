# 도메인 타입 명세

이 문서는 PickMa 앱 내부에서 사용하는 Domain Type의 기준을 정의한다. API request/response DTO는 `docs/api_spec.md`와 `src/contracts/*` 기준을 따르고, DB 저장 구조는 `docs/erd.md` 기준을 따른다.

Domain Type은 UI와 비즈니스 로직에서 바로 쓰기 좋은 형태를 목표로 한다.

- 필드명은 camelCase를 사용한다.
- 날짜는 `Date`를 사용한다.
- DB/API 상태값과 1:1 대응을 강제하지 않는다.
- 계산값과 표시용 파생값을 포함할 수 있다.

---

## 1. 공통 타입

```ts
export type SortOrder = 'asc' | 'desc';

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
```

---

## 2. Auth / User

Auth는 Supabase Auth user 식별과 세션 상태를 의미한다. User는 PickMa 서비스 내부 사용자 정보를 의미한다.

```ts
export type AuthProvider = 'google' | 'kakao' | 'email';

export interface AuthUser {
  id: string;
  email?: string;
  provider?: AuthProvider;
}

export interface AuthSession {
  user: AuthUser;
  expiresAt?: number;
}

export interface AuthResult {
  user?: AuthUser;
  session?: AuthSession;
}

export type UserRole = 'customer' | 'seller' | 'admin';

export type UserStatus = 'active' | 'suspended' | 'deleted';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  profileImage?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 3. Store

```ts
export type StoreStatus = 'pending' | 'approved' | 'rejected' | 'inactive';

export interface Store {
  id: string;
  userId: string;
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
  status: StoreStatus;
  rejectReason?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

판매자 화면에서 자주 쓰는 내 가게 상태는 Store를 기반으로 구성한다.

```ts
export interface MyStore extends Store {
  canSell: boolean;
}
```

---

## 4. Catalog

Catalog는 Category, MenuItem, Product로 구성한다.

```ts
export interface Category {
  id: string;
  name: string;
  icon?: string;
  sortOrder: number;
  createdAt: Date;
}

export interface MenuItem {
  id: string;
  storeId: string;
  categoryId?: string;
  name: string;
  description?: string;
  image?: string;
  originalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 5. Product

Product는 특정 시점에 판매되는 실제 판매 단위이다.

```ts
export type ProductStatus = 'active' | 'closed';

export type ProductDisplayStatus =
  | 'available'
  | 'soldOut'
  | 'expired'
  | 'closed';

export interface Product {
  id: string;
  storeId: string;
  storeName: string;
  categoryId?: string;
  categoryName?: string;
  menuItemId: string;
  name: string;
  description?: string;
  image?: string;
  originalPrice: number;
  discountPrice: number;
  discountRate: number;
  stock: number;
  reservedStock: number;
  availableStock: number;
  endAt: Date;
  pickupStartTime: Date;
  pickupEndTime: Date;
  status: ProductStatus;
  isSoldOut: boolean;
  isExpired: boolean;
  displayStatus: ProductDisplayStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
```

상품 상세에서는 가게 정보를 함께 포함한다.

```ts
export interface ProductDetail extends Product {
  store: Pick<
    Store,
    | 'id'
    | 'name'
    | 'description'
    | 'phone'
    | 'address'
    | 'addressDetail'
    | 'region'
    | 'image'
  >;
}
```

상품 목록 조회 요청 파라미터는 API contract이므로 `docs/api_spec.md`와 `src/contracts/product.ts` 기준을 따른다. 화면에서 필터 상태가 필요하면 API request 타입을 그대로 재사용하지 않고 별도 UI state 타입이나 변환 함수를 둔다.

---

## 6. Order

주문은 결제 전 대기, 예약 확정, 픽업 완료, 취소, 노쇼 흐름을 가진다. 실제 DB/API 상태값은 구현 중 조정될 수 있으며, Domain은 화면과 비즈니스 로직에서 필요한 상태를 표현한다.

```ts
export type OrderStatus =
  | 'paymentPending'
  | 'reserved'
  | 'ready'
  | 'completed'
  | 'cancelled'
  | 'noShow'
  | 'expired';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  originalPrice: number;
  discountPrice: number;
  quantity: number;
  subtotal: number;
  createdAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  storeOrderNumber?: string;
  pickupNumber?: string;
  userId: string;
  storeId: string;
  storeName: string;
  totalAmount: number;
  discountAmount: number;
  paymentAmount: number;
  status: OrderStatus;
  pickupAt: Date;
  pickupServiceDate: Date;
  expiresAt?: Date;
  pickedUpAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  items: OrderItem[];
  payment?: Payment;
  createdAt: Date;
  updatedAt: Date;
}
```

주문번호 정책:

- `orderNumber`는 PG 결제와 전체 주문 추적에 사용하는 전역 고유 번호다. 주문 생성 시 생성하고 결제 결과와 무관하게 변경하지 않는다.
- `storeOrderNumber`와 `pickupNumber`는 결제 완료 후 판매자 운영/현장 픽업 확인을 위해 부여한다. 결제 대기 또는 만료 주문에는 없을 수 있다.
- `pickupServiceDate`는 `pickupAt`의 날짜 부분이며, 매장별 일별 순번 기준이다.
- 취소/환불/노쇼가 발생해도 이미 부여된 `storeOrderNumber`와 `pickupNumber`는 회수하거나 재사용하지 않는다.

주문 생성 후 결제 위젯에 전달할 정보는 별도 Domain 결과로 둔다.

```ts
export interface CreatedOrderPaymentInfo {
  id: string;
  orderNumber: string;
  orderName: string;
  paymentAmount: number;
  expiresAt: Date;
}
```

---

## 7. Payment

- provider: 결제 승인 주체 (`mock | toss | kakao_pay | naver_pay`)
- method: 사용자가 선택한 결제 수단 (`card | virtual_account | mobile | easy_pay`)

```ts
export type PaymentProvider = 'mock' | 'toss' | 'kakao_pay' | 'naver_pay';

export type PaymentMethod = 'card' | 'virtual_account' | 'mobile' | 'easy_pay';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export interface Payment {
  id: string;
  orderId: string;
  orderNumber: string;
  provider: PaymentProvider;
  providerPaymentKey?: string;
  providerOrderId?: string;
  method: PaymentMethod;
  methodDetail?: string;
  amount: number;
  status: PaymentStatus;
  paidAt?: Date;
  refundedAt?: Date;
  refundReason?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 8. Wishlist

Wishlist는 MVP 이후 기능으로 둔다.

```ts
export interface WishlistItem {
  id: string;
  userId: string;
  storeId: string;
  storeName: string;
  storeImage?: string;
  region: string;
  createdAt: Date;
}
```

---

## 9. Admin View Models

관리자 화면은 일반 Domain을 기반으로 필요한 통계/목록 모델을 별도로 둔다.

```ts
export interface AdminDashboardStats {
  totalUsers: number;
  totalStores: number;
  pendingStores: number;
  totalProducts: number;
  totalOrders: number;
  totalSalesAmount: number;
}

export interface DailyAdminMetric {
  date: Date;
  orderCount: number;
  salesAmount: number;
  newUserCount: number;
  newStoreCount: number;
}
```

---

## 10. Mapper 주의사항

- Contract DTO의 ISO string 날짜는 client mapper에서 `Date`로 변환한다.
- `Product.availableStock`, `Product.discountRate`, `Product.isSoldOut`, `Product.isExpired`, `Product.displayStatus`는 mapper에서 계산한다.
- Product 저장 상태는 `active | closed`만 사용하고, 품절/마감은 `isSoldOut`, `isExpired`, `displayStatus`로 파생한다.
- Order 저장/API 상태 `payment_pending`, `no_show`는 Domain에서 `paymentPending`, `noShow`로 변환한다.
- DB 저장 status와 Domain status가 다르면 mapper에서 명시적으로 변환한다.
- hook/component는 Contract DTO를 직접 사용하지 않는다.
