import { LayoutDashboard, ClipboardCheck, Store } from 'lucide-react';

import type { SidebarSection } from '@/components/common/Sidebar/Sidebar.types';

export const adminSidebarSections: SidebarSection[] = [
  {
    id: 'dashboard',
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
    id: 'store-management',
    title: '가게 관리',
    items: [
      {
        id: 'pending-stores',
        label: '가게 승인',
        href: '/admin/stores/pending',
        icon: ClipboardCheck,
      },
      {
        id: 'stores',
        label: '전체 가게',
        href: '/admin/stores',
        icon: Store,
      },
    ],
  },
];
