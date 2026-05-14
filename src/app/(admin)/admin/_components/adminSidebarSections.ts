import { LayoutDashboard, Store, Users } from 'lucide-react';

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
      {
        id: 'seller-management',
        label: '판매자 관리',
        icon: Users,
        children: [
          {
            id: 'pending-sellers',
            label: '판매자 승인',
            href: '/admin/sellers/pending',
          },
        ],
      },
      {
        id: 'store-management',
        label: '가게 관리',
        icon: Store,
        children: [
          {
            id: 'stores',
            label: '전체 가게',
            href: '/admin/stores',
          },
        ],
      },
    ],
  },
];
