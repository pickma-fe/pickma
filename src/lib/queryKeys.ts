export const queryKeys = {
  auth: {
    session: () => ['auth', 'session'] as const,
  },

  users: {
    all: () => ['users'] as const,
    me: () => ['users', 'me'] as const,
  },

  stores: {
    all: () => ['stores'] as const,
    my: () => ['stores', 'my'] as const,
  },

  categories: {
    all: () => ['categories'] as const,
    list: () => ['categories', 'list', 'all'] as const,
  },

  products: {
    all: () => ['products'] as const,
    lists: () => ['products', 'list'] as const,
    list: (params: object) => ['products', 'list', params] as const,
    details: () => ['products', 'detail'] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
    sellerList: () => ['products', 'seller', 'list'] as const,
  },

  orders: {
    all: () => ['orders'] as const,
    lists: () => ['orders', 'list'] as const,
    list: (query: object) => ['orders', 'list', query] as const,
    details: () => ['orders', 'detail'] as const,
    detail: (id: string) => ['orders', 'detail', id] as const,
  },

  seller: {
    orders: {
      all: () => ['seller', 'orders'] as const,
      lists: () => ['seller', 'orders', 'list'] as const,
      list: (params: object) => ['seller', 'orders', 'list', params] as const,
      details: () => ['seller', 'orders', 'detail'] as const,
      detail: (id: string) => ['seller', 'orders', 'detail', id] as const,
    },
    menuItems: {
      all: () => ['menu-items', 'seller'] as const,
      list: (params: object) => ['menu-items', 'seller', params] as const,
    },
    onboardingStatus: () => ['sellers', 'onboarding-status'] as const,
  },

  admin: {
    sellers: {
      all: () => ['sellers'] as const,
      pending: () => ['sellers', 'pending'] as const,
      pendingList: (params: object) => ['sellers', 'pending', params] as const,
    },
  },
} as const;

export const invalidateTargets = {
  afterPaymentSuccess: [
    queryKeys.orders.lists(),
    queryKeys.products.lists(),
    queryKeys.products.sellerList(),
  ],
  afterCreateOrder: [queryKeys.orders.lists(), queryKeys.products.lists()],
  afterCancelOrder: [queryKeys.orders.lists()],
  afterConfirmPayment: [queryKeys.orders.lists(), queryKeys.orders.details()],
} as const;
