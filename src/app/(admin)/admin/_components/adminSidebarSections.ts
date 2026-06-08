import {
  ClipboardList,
  LayoutDashboard,
  Package,
  Store,
  Users,
} from 'lucide-react';

import type { SidebarSection } from '@/components/common/Sidebar/Sidebar.types';

export const adminSidebarSections: SidebarSection[] = [
  {
    id: 'main',
    items: [
      {
        id: 'dashboard',
        label: '대시보드',
        href: '/admin',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: 'management',
    title: '관리',
    items: [
      {
        id: 'seller-management',
        label: '판매자 관리',
        href: '/admin/sellers/pending',
        icon: Users,
      },
      {
        id: 'store-management',
        label: '가게 관리',
        href: '/admin/stores',
        icon: Store,
      },
      {
        id: 'user-management',
        label: '사용자 관리',
        href: '/admin/users',
        icon: Users,
      },
      {
        id: 'product-management',
        label: '상품 관리',
        href: '/admin/products',
        icon: Package,
      },
      {
        id: 'order-management',
        label: '주문 관리',
        href: '/admin/orders',
        icon: ClipboardList,
      },
    ],
  },
];
