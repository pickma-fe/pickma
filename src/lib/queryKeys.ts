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
    sellerDetails: () => ['products', 'seller', 'detail'] as const,
    sellerDetail: (id: string) => ['products', 'seller', 'detail', id] as const,
  },

  orders: {
    all: () => ['orders'] as const,
    lists: () => ['orders', 'list'] as const,
    list: (query: object) => ['orders', 'list', query] as const,
    details: () => ['orders', 'detail'] as const,
    detail: (id: string) => ['orders', 'detail', id] as const,
  },

  sellers: {
    orders: {
      all: () => ['sellers', 'orders'] as const,
      lists: () => ['sellers', 'orders', 'list'] as const,
      list: (params: object) => ['sellers', 'orders', 'list', params] as const,
      summary: () => ['sellers', 'orders', 'summary'] as const,
      details: () => ['sellers', 'orders', 'detail'] as const,
      detail: (id: string) => ['sellers', 'orders', 'detail', id] as const,
    },
    menuItems: {
      all: () => ['sellers', 'menu-items'] as const,
      list: (params: object) => ['sellers', 'menu-items', params] as const,
    },
    onboardingStatus: () => ['sellers', 'onboarding-status'] as const,
    application: {
      my: () => ['sellers', 'application', 'my'] as const,
      documentSignedUrl: (documentId: string) =>
        [
          'sellers',
          'application',
          'document',
          documentId,
          'signed-url',
        ] as const,
    },
    dashboard: {
      stats: () => ['sellers', 'dashboard', 'stats'] as const,
    },
  },

  admin: {
    dashboard: {
      stats: () => ['admin', 'dashboard', 'stats'] as const,
    },
    sellers: {
      all: () => ['admin', 'sellers'] as const,
      pending: () => ['admin', 'sellers', 'pending'] as const,
      pendingList: (params: object) =>
        ['admin', 'sellers', 'pending', params] as const,
    },
    stores: {
      all: () => ['admin', 'stores'] as const,
      list: (params: object) => ['admin', 'stores', 'list', params] as const,
    },
    users: {
      all: () => ['admin', 'users'] as const,
      list: (params: object) => ['admin', 'users', 'list', params] as const,
    },
    products: {
      all: () => ['admin', 'products'] as const,
      list: (params: object) => ['admin', 'products', 'list', params] as const,
    },
    orders: {
      all: () => ['admin', 'orders'] as const,
      list: (params: object) => ['admin', 'orders', 'list', params] as const,
    },
  },
} as const;

export const invalidateTargets = {
  afterPaymentSuccess: [
    queryKeys.orders.lists(),
    queryKeys.products.lists(),
    queryKeys.products.details(),
    queryKeys.products.sellerList(),
  ],
  afterCreateOrder: [
    queryKeys.orders.lists(),
    queryKeys.products.lists(),
    queryKeys.products.details(),
  ],
  afterCancelOrder: [queryKeys.orders.lists(), queryKeys.orders.details()],
  afterConfirmPayment: [
    queryKeys.orders.lists(),
    queryKeys.orders.details(),
    queryKeys.products.lists(),
    queryKeys.products.details(),
  ],
  afterCancelPayment: [queryKeys.orders.lists(), queryKeys.orders.details()],
} as const;
