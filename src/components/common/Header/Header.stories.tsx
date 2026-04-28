import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Header } from './Header';

function SearchInput() {
  return <input type="search" placeholder="상품 검색" />;
}

const meta = {
  title: 'common/Header',
  component: Header,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Customer: Story = {
  args: {
    user: {
      id: '1',
      name: '홍길동',
      email: 'customer@example.com',
      phone: null,
      role: 'customer',
      status: 'active',
      profileImageUrl: null,
    },
    logoHref: '/',
    slot: <SearchInput />,
    menuItems: [
      { label: '내 예약', type: 'link', href: '/reservations' },
      { label: '로그아웃', type: 'action', onClick: fn() },
    ],
  },
};

export const CustomerWithAvatar: Story = {
  args: {
    user: {
      id: '1',
      name: '홍길동',
      email: 'customer@example.com',
      phone: null,
      role: 'customer',
      profileImageUrl: null,
      status: 'active',
    },
    logoHref: '/',
    slot: <SearchInput />,
    menuItems: [
      { label: '내 예약', type: 'link', href: '/reservations' },
      { label: '로그아웃', type: 'action', onClick: fn() },
    ],
  },
};

export const Seller: Story = {
  args: {
    user: {
      id: '2',
      name: '가게사장',
      email: 'seller@example.com',
      phone: null,
      role: 'seller',
      status: 'active',
      profileImageUrl: null,
    },
    logoHref: '/seller',
    menuItems: [
      { label: '가게 관리', type: 'link', href: '/seller' },
      { label: '로그아웃', type: 'action', onClick: fn() },
    ],
  },
};

export const Admin: Story = {
  args: {
    user: {
      id: '3',
      name: '관리자',
      email: 'admin@example.com',
      phone: null,
      role: 'admin',
      status: 'active',
      profileImageUrl: null,
    },
    logoHref: '/admin',
    menuItems: [
      { label: '관리자 대시보드', type: 'link', href: '/admin' },
      { label: '로그아웃', type: 'action', onClick: fn() },
    ],
  },
};

export const Guest: Story = {
  args: {
    user: null,
    logoHref: '/',
    slot: <SearchInput />,
    menuItems: [
      { label: '판매자 등록', type: 'link', href: '/seller/register' },
      { label: '회원가입', type: 'link', href: '/signup' },
      { label: '로그인', type: 'action', onClick: fn() },
    ],
  },
};

export const WithoutLogoLink: Story = {
  args: {
    user: null,
    slot: <SearchInput />,
    menuItems: [{ label: '로그인', type: 'action', onClick: fn() }],
  },
};
