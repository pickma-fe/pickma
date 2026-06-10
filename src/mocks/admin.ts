import type {
  AdminOrderListQuery,
  AdminOrderListResponse,
  AdminOrderResponse,
  AdminPendingSellerApplicationListQuery,
  AdminPendingSellerApplicationListResponse,
  AdminPendingSellerApplicationResponse,
  AdminDashboardStatsResponse,
  AdminProductListQuery,
  AdminProductListResponse,
  AdminProductResponse,
  AdminStoreListQuery,
  AdminStoreListResponse,
  AdminStoreResponse,
  AdminUserListQuery,
  AdminUserListResponse,
  AdminUserResponse,
} from '@/contracts/admin';
import type { SellerApplicationDocumentReadUrlResponse } from '@/contracts/seller-application';

export const mockAdminPendingSellerApplication: AdminPendingSellerApplicationResponse =
  {
    id: 'application_mock_1',
    userId: 'user_mock_1',
    applicantEmail: 'seller@example.com',
    applicantName: '테스트 대표',
    status: 'pending',
    businessNumber: '000-00-00001',
    companyName: '테스트 회사',
    representativeName: '테스트 대표',
    businessAddress: '서울시 테스트구 테스트로 1',
    businessType: '식품',
    businessCategory: '베이커리',
    documents: [],
    createdAt: '2026-05-18T00:00:00.000Z',
    updatedAt: '2026-05-18T00:00:00.000Z',
  };

export const mockAdminPendingSellerApplicationList: AdminPendingSellerApplicationListResponse =
  {
    items: [mockAdminPendingSellerApplication],
    page: 1,
    pageSize: 20,
    totalCount: 1,
    totalPages: 1,
  };

function getKoreanDateString(value: string): string {
  const date = new Date(value);

  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function sanitizeMockSearchValue(value: string): string {
  return value.replace(/[,()*]/g, ' ').trim();
}

function matchesPendingSellerApplicationQuery(
  application: AdminPendingSellerApplicationResponse,
  query: AdminPendingSellerApplicationListQuery
): boolean {
  const keyword = query.keyword
    ? sanitizeMockSearchValue(query.keyword).toLowerCase()
    : '';
  const businessCategory = query.businessCategory
    ? sanitizeMockSearchValue(query.businessCategory).toLowerCase()
    : '';
  const matchesKeyword =
    keyword.length === 0 ||
    [
      application.companyName,
      application.representativeName,
      application.applicantName,
      application.applicantEmail,
      application.applicantPhone,
      application.businessNumber,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(keyword);
  const matchesCreatedDate =
    !query.createdDate ||
    getKoreanDateString(application.createdAt) === query.createdDate;
  const matchesCategory =
    businessCategory.length === 0 ||
    application.businessCategory.toLowerCase().includes(businessCategory);

  return matchesKeyword && matchesCreatedDate && matchesCategory;
}

export function filterMockAdminPendingSellerApplications(
  query: AdminPendingSellerApplicationListQuery
): AdminPendingSellerApplicationListResponse {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? PAGE_SIZE;
  const filteredItems = mockAdminPendingSellerApplicationList.items.filter(
    (application) => matchesPendingSellerApplicationQuery(application, query)
  );
  const start = (page - 1) * pageSize;
  const items = filteredItems.slice(start, start + pageSize);

  return {
    items,
    page,
    pageSize,
    totalCount: filteredItems.length,
    totalPages: Math.ceil(filteredItems.length / pageSize),
  };
}

export const mockDocumentReadUrl: SellerApplicationDocumentReadUrlResponse = {
  signedUrl: 'https://example.com/mock-signed-document-url',
};

const PAGE_SIZE = 20;

export const mockAdminStores: AdminStoreResponse[] = [
  {
    id: 'store_1',
    userId: 'user_seller_1',
    name: '픽마 베이커리',
    description: '매일 아침 굽는 동네 베이커리입니다.',
    businessNumber: '123-45-67890',
    phone: '02-1234-5678',
    address: '서울시 마포구 월드컵북로 12',
    addressDetail: '1층',
    region: '서울 마포구',
    image: '/images/mock/stores/bakery.png',
    status: 'active',
    operationStatus: 'open',
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-20T00:00:00.000Z',
  },
  {
    id: 'store_inactive_1',
    userId: 'user_seller_2',
    name: '픽마 델리',
    businessNumber: '987-65-43210',
    phone: '02-9876-5432',
    address: '서울시 성동구 왕십리로 20',
    region: '서울 성동구',
    status: 'inactive',
    operationStatus: 'open',
    createdAt: '2026-04-25T00:00:00.000Z',
    updatedAt: '2026-04-25T00:00:00.000Z',
  },
];

export const mockAdminStoreList: AdminStoreListResponse = {
  items: mockAdminStores,
  page: 1,
  pageSize: PAGE_SIZE,
  totalCount: mockAdminStores.length,
  totalPages: Math.ceil(mockAdminStores.length / PAGE_SIZE),
};

export function filterMockAdminStores(
  query: AdminStoreListQuery = {}
): AdminStoreListResponse {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? PAGE_SIZE;
  const keyword = query.keyword
    ? sanitizeMockSearchValue(query.keyword).toLowerCase()
    : '';
  const region = query.region
    ? sanitizeMockSearchValue(query.region).toLowerCase()
    : '';

  const filteredItems = mockAdminStores.filter((store) => {
    const matchesStatus = query.status ? store.status === query.status : true;
    const matchesRegion = region
      ? store.region.toLowerCase().includes(region)
      : true;
    const matchesKeyword = keyword
      ? [store.name, store.businessNumber, store.phone, store.address].some(
          (value) => value.toLowerCase().includes(keyword)
        )
      : true;

    return matchesStatus && matchesRegion && matchesKeyword;
  });
  const offset = (page - 1) * pageSize;

  return {
    items: filteredItems.slice(offset, offset + pageSize),
    page,
    pageSize,
    totalCount: filteredItems.length,
    totalPages: Math.ceil(filteredItems.length / pageSize),
  };
}

const pendingStores = mockAdminStores.filter(
  (store) => store.status === 'inactive'
);

export const mockPendingAdminStoreList: AdminStoreListResponse = {
  items: pendingStores,
  page: 1,
  pageSize: PAGE_SIZE,
  totalCount: pendingStores.length,
  totalPages: Math.ceil(pendingStores.length / PAGE_SIZE),
};

export const mockAdminUsers: AdminUserResponse[] = [
  {
    id: 'user_customer_1',
    email: 'customer@example.com',
    name: '김픽마',
    phone: '010-1111-2222',
    role: 'customer',
    status: 'active',
    createdAt: '2026-05-01T00:00:00.000Z',
    updatedAt: '2026-05-01T00:00:00.000Z',
  },
  {
    id: 'user_seller_1',
    email: 'seller@example.com',
    name: '박판매',
    phone: '010-3333-4444',
    role: 'seller',
    status: 'active',
    createdAt: '2026-05-02T00:00:00.000Z',
    updatedAt: '2026-05-02T00:00:00.000Z',
  },
  {
    id: 'user_admin_1',
    email: 'admin@example.com',
    name: '관리자',
    role: 'admin',
    status: 'active',
    createdAt: '2026-05-03T00:00:00.000Z',
    updatedAt: '2026-05-03T00:00:00.000Z',
  },
];

export function filterMockAdminUsers(
  query: AdminUserListQuery = {}
): AdminUserListResponse {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? PAGE_SIZE;
  const keyword = query.keyword
    ? sanitizeMockSearchValue(query.keyword).toLowerCase()
    : '';
  const filteredItems = mockAdminUsers.filter((user) => {
    const matchesKeyword = keyword
      ? [user.email, user.name, user.phone]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(keyword)
      : true;
    const matchesRole = query.role ? user.role === query.role : true;
    const matchesStatus = query.status ? user.status === query.status : true;

    return matchesKeyword && matchesRole && matchesStatus;
  });
  const offset = (page - 1) * pageSize;

  return {
    items: filteredItems.slice(offset, offset + pageSize),
    page,
    pageSize,
    totalCount: filteredItems.length,
    totalPages: Math.ceil(filteredItems.length / pageSize),
  };
}

export const mockAdminProducts: AdminProductResponse[] = [
  {
    id: 'product_1',
    storeId: 'store_1',
    storeName: '픽마 베이커리',
    categoryId: 'category_bakery',
    categoryName: '베이커리',
    menuItemId: 'menu_item_1',
    name: '마감 식빵 세트',
    originalPrice: 12000,
    discountPrice: 7000,
    discountRate: 42,
    stock: 10,
    reservedStock: 2,
    availableStock: 8,
    isSoldOut: false,
    isExpired: false,
    displayStatus: 'available',
    endAt: '2026-06-30T09:00:00.000Z',
    pickupStartTime: '18:00',
    pickupEndTime: '20:00',
    status: 'active',
    updatedAt: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'product_2',
    storeId: 'store_inactive_1',
    storeName: '픽마 델리',
    categoryName: '음식점',
    menuItemId: 'menu_item_2',
    name: '샐러드 런치팩',
    originalPrice: 10000,
    discountPrice: 6000,
    discountRate: 40,
    stock: 0,
    reservedStock: 4,
    availableStock: 0,
    isSoldOut: true,
    isExpired: false,
    displayStatus: 'soldOut',
    endAt: '2026-06-30T09:00:00.000Z',
    pickupStartTime: '17:00',
    pickupEndTime: '19:00',
    status: 'closed',
    updatedAt: '2026-06-02T00:00:00.000Z',
  },
];

export function filterMockAdminProducts(
  query: AdminProductListQuery = {}
): AdminProductListResponse {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? PAGE_SIZE;
  const keyword = query.keyword
    ? sanitizeMockSearchValue(query.keyword).toLowerCase()
    : '';
  const filteredItems = mockAdminProducts.filter((product) => {
    const matchesKeyword = keyword
      ? [product.name, product.storeName].some((value) =>
          value.toLowerCase().includes(keyword)
        )
      : true;
    const matchesStatus = query.status ? product.status === query.status : true;
    const matchesStore = query.storeId
      ? product.storeId === query.storeId
      : true;

    return matchesKeyword && matchesStatus && matchesStore;
  });
  const offset = (page - 1) * pageSize;

  return {
    items: filteredItems.slice(offset, offset + pageSize),
    page,
    pageSize,
    totalCount: filteredItems.length,
    totalPages: Math.ceil(filteredItems.length / pageSize),
  };
}

export const mockAdminOrders: AdminOrderResponse[] = [
  {
    id: 'order_1',
    orderNumber: 'ORDER-20260601-0001',
    storeId: 'store_1',
    storeName: '픽마 베이커리',
    totalAmount: 12000,
    discountAmount: 5000,
    paymentAmount: 7000,
    status: 'reserved',
    pickupAt: '2026-06-01T10:00:00.000Z',
    pickupServiceDate: '2026-06-01',
    storeOrderNumber: '20260601-0000001',
    pickupNumber: '101',
    createdAt: '2026-06-01T01:00:00.000Z',
    updatedAt: '2026-06-01T01:00:00.000Z',
  },
  {
    id: 'order_2',
    orderNumber: 'ORDER-20260602-0002',
    storeId: 'store_inactive_1',
    storeName: '픽마 델리',
    totalAmount: 10000,
    discountAmount: 4000,
    paymentAmount: 6000,
    status: 'processing',
    pickupAt: '2026-06-02T10:00:00.000Z',
    pickupServiceDate: '2026-06-02',
    createdAt: '2026-06-02T01:00:00.000Z',
    updatedAt: '2026-06-02T01:00:00.000Z',
  },
];

export function filterMockAdminOrders(
  query: AdminOrderListQuery = {}
): AdminOrderListResponse {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? PAGE_SIZE;
  const keyword = query.keyword
    ? sanitizeMockSearchValue(query.keyword).toLowerCase()
    : '';
  const sortedOrders = [...mockAdminOrders].sort((a, b) => {
    const sort = query.sort ?? 'createdAt';
    const order = query.order ?? 'desc';
    const left = sort === 'pickupAt' ? a.pickupAt : a.createdAt;
    const right = sort === 'pickupAt' ? b.pickupAt : b.createdAt;
    const direction = order === 'asc' ? 1 : -1;

    return left.localeCompare(right) * direction;
  });
  const filteredItems = sortedOrders.filter((order) => {
    const matchesKeyword = keyword
      ? [order.orderNumber, order.storeOrderNumber, order.pickupNumber]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(keyword)
      : true;
    const matchesStatus = query.status ? order.status === query.status : true;

    return matchesKeyword && matchesStatus;
  });
  const offset = (page - 1) * pageSize;

  return {
    items: filteredItems.slice(offset, offset + pageSize),
    page,
    pageSize,
    totalCount: filteredItems.length,
    totalPages: Math.ceil(filteredItems.length / pageSize),
  };
}

export const mockAdminDashboardStats: AdminDashboardStatsResponse = {
  totalStores: mockAdminStores.length,
  totalProducts: 1524,
  totalOrders: 8342,
  totalUsers: 12680,
  dailyMetrics: [
    {
      date: '2026-05-30T00:00:00.000Z',
      orderCount: 650,
      salesAmount: 32_000_000,
    },
    {
      date: '2026-05-31T00:00:00.000Z',
      orderCount: 820,
      salesAmount: 41_000_000,
    },
    {
      date: '2026-06-01T00:00:00.000Z',
      orderCount: 870,
      salesAmount: 43_000_000,
    },
    {
      date: '2026-06-02T00:00:00.000Z',
      orderCount: 760,
      salesAmount: 37_000_000,
    },
    {
      date: '2026-06-03T00:00:00.000Z',
      orderCount: 910,
      salesAmount: 45_000_000,
    },
    {
      date: '2026-06-04T00:00:00.000Z',
      orderCount: 800,
      salesAmount: 39_000_000,
    },
    {
      date: '2026-06-05T00:00:00.000Z',
      orderCount: 700,
      salesAmount: 34_000_000,
    },
  ],
  recentPendingApplications: [
    {
      id: mockAdminPendingSellerApplication.id,
      companyName: mockAdminPendingSellerApplication.companyName,
      businessCategory: mockAdminPendingSellerApplication.businessCategory,
      createdAt: mockAdminPendingSellerApplication.createdAt,
    },
  ],
  recentOrders: [
    {
      id: 'order_mock_1',
      productName: '연어 샐러드',
      storeName: '샐러디 강남점',
      paymentAmount: 12900,
      status: 'ready',
      createdAt: '2026-06-05T03:30:00.000Z',
    },
    {
      id: 'order_mock_2',
      productName: '아메리카노',
      storeName: '커피에 반하다 역삼점',
      paymentAmount: 4500,
      status: 'completed',
      createdAt: '2026-06-05T02:40:00.000Z',
    },
  ],
  recentUsers: [
    {
      id: 'user_mock_1',
      name: '김민지',
      email: 'minji@example.com',
      createdAt: '2026-06-05T00:00:00.000Z',
    },
    {
      id: 'user_mock_2',
      name: '박서준',
      email: 'park@example.com',
      createdAt: '2026-06-04T00:00:00.000Z',
    },
  ],
};
