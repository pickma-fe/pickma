import { Store, Package, ClipboardList, LayoutDashboard } from 'lucide-react';

import type { SidebarSection } from '@/components/common/Sidebar/Sidebar.types';

export const sellerSidebarSections: SidebarSection[] = [
  {
    id: 'dashboard',
    items: [
      {
        id: 'dashboard',
        label: '대시보드',
        icon: LayoutDashboard,
        href: '/seller/dashboard',
      },
    ],
  },
  {
    id: 'store',
    items: [
      {
        id: 'store-management',
        label: '가게 관리',
        icon: Store,
        children: [
          {
            id: 'store-info',
            label: '가게 정보 관리',
            href: '/seller/store',
          },
          {
            id: 'menu',
            label: '메뉴 관리',
            href: '/seller/menu',
          },
        ],
      },
    ],
  },
  {
    id: 'product',
    items: [
      {
        id: 'products',
        label: '상품 관리',
        icon: Package,
        href: '/seller/products',
      },
    ],
  },
  {
    id: 'order',
    items: [
      {
        id: 'order-list',
        label: '주문 관리',
        icon: ClipboardList,
        href: '/seller/orders',
      },
    ],
  },
];
