import {
  LayoutDashboard,
  Store,
  UtensilsCrossed,
  Package,
  ClipboardList,
  Megaphone,
} from 'lucide-react';

import type { SidebarSection } from '@/components/common/Sidebar/Sidebar.types';

export const sellerSidebarSections: SidebarSection[] = [
  {
    id: 'main',
    items: [
      {
        id: 'dashboard',
        label: '대시보드',
        href: '/seller/dashboard',
        icon: LayoutDashboard,
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
        children: [
          {
            id: 'product-list',
            label: '상품 목록',
            href: '/seller/products',
          },
          {
            id: 'product-new',
            label: '상품 등록',
            href: '/seller/products/new',
          },
        ],
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
        children: [
          {
            id: 'order-list',
            label: '주문 확인',
            href: '/seller/orders',
          },
          {
            id: 'order-refund',
            label: '주문 취소/환불',
            href: '/seller/orders/refund',
          },
        ],
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
