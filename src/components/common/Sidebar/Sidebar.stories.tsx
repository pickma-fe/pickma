import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Users,
} from 'lucide-react';

import { Sidebar } from './Sidebar';
import type { SidebarSection } from './Sidebar.types';

const FLAT_SECTIONS: SidebarSection[] = [
  {
    id: 'main',
    title: '메인',
    items: [
      {
        id: 'dashboard',
        label: '대시보드',
        href: '/admin',
        icon: LayoutDashboard,
      },
      {
        id: 'orders',
        label: '주문 관리',
        href: '/admin/orders',
        icon: ShoppingCart,
      },
      {
        id: 'products',
        label: '상품 관리',
        href: '/admin/products',
        icon: Package,
      },
    ],
  },
];

const NESTED_SECTIONS: SidebarSection[] = [
  {
    id: 'main',
    title: '관리',
    items: [
      {
        id: 'dashboard',
        label: '대시보드',
        href: '/admin',
        icon: LayoutDashboard,
      },
      {
        id: 'users',
        label: '사용자',
        icon: Users,
        children: [
          { id: 'users-list', label: '사용자 목록', href: '/admin/users' },
          {
            id: 'users-sellers',
            label: '판매자 목록',
            href: '/admin/users/sellers',
          },
        ],
      },
      {
        id: 'settings',
        label: '설정',
        icon: Settings,
        children: [
          {
            id: 'settings-general',
            label: '일반',
            href: '/admin/settings/general',
          },
          {
            id: 'settings-payment',
            label: '결제',
            href: '/admin/settings/payment',
          },
        ],
      },
    ],
  },
];

const MIXED_SECTIONS: SidebarSection[] = [
  {
    id: 'overview',
    title: '개요',
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
    id: 'manage',
    title: '관리',
    items: [
      {
        id: 'users',
        label: '사용자',
        icon: Users,
        children: [
          { id: 'users-list', label: '사용자 목록', href: '/admin/users' },
          {
            id: 'users-sellers',
            label: '판매자 목록',
            href: '/admin/users/sellers',
            disabled: true,
          },
        ],
      },
      {
        id: 'products',
        label: '상품 관리',
        href: '/admin/products',
        icon: Package,
      },
    ],
  },
];

const meta = {
  title: 'common/Sidebar',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── 기본: flat 구조 ───────────────────────────────────────────────────────────

export const Flat: Story = {
  name: '기본 — flat 구조',
  parameters: { nextjs: { navigation: { pathname: '/admin' } } },
  render: () => <Sidebar sections={FLAT_SECTIONS} />,
};

// ─── 기본: nested 구조 (accordion 닫힌 상태) ──────────────────────────────────

export const NestedClosed: Story = {
  name: 'Nested — 아코디언 닫힌 상태',
  parameters: { nextjs: { navigation: { pathname: '/other' } } },
  render: () => <Sidebar sections={NESTED_SECTIONS} />,
};

// ─── Nested: 자식 active → 아코디언 열린 상태 ─────────────────────────────────

export const NestedChildActive: Story = {
  name: 'Nested — 자식 active (아코디언 열림)',
  parameters: { nextjs: { navigation: { pathname: '/admin/users/sellers' } } },
  render: () => <Sidebar sections={NESTED_SECTIONS} />,
};

// ─── 여러 섹션 + disabled + 혼합 구조 ─────────────────────────────────────────

export const Mixed: Story = {
  name: '혼합 — 여러 섹션 + disabled',
  parameters: { nextjs: { navigation: { pathname: '/admin/products' } } },
  render: () => <Sidebar sections={MIXED_SECTIONS} />,
};

// ─── 아이콘 없는 구조 ──────────────────────────────────────────────────────────

export const NoIcons: Story = {
  name: '아이콘 없음',
  parameters: { nextjs: { navigation: { pathname: '/admin/orders' } } },
  render: () => (
    <Sidebar
      sections={[
        {
          id: 'main',
          items: [
            { id: 'dashboard', label: '대시보드', href: '/admin' },
            { id: 'orders', label: '주문 관리', href: '/admin/orders' },
            { id: 'products', label: '상품 관리', href: '/admin/products' },
          ],
        },
      ]}
    />
  ),
};
