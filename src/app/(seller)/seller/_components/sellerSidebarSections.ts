import {
  Store,
  Package,
  ClipboardList,
  Megaphone,
  UtensilsCrossed,
} from 'lucide-react';

import type { SidebarSection } from '@/components/common/Sidebar/Sidebar.types';

export const sellerSidebarSections: SidebarSection[] = [
  {
    id: 'store',
    items: [
      {
        id: 'store-management',
        label: '가게 관리',
        icon: Store,
        children: [
          {
            id: 'store-register',
            label: '인증 및 가게 등록',
            href: '/seller/register',
          },
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
        id: 'orders',
        label: '주문 관리',
        icon: ClipboardList,
        href: '/seller/orders',
      },
    ],
  },
  {
    id: 'etc',
    items: [
      {
        id: 'review',
        label: '리뷰 관리',
        href: '/seller/reviews',
        icon: Megaphone,
      },
      {
        id: 'notice',
        label: '공지사항',
        href: '/seller/notice',
        icon: UtensilsCrossed,
      },
    ],
  },
];
