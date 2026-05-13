'use client';

import { Store, User } from 'lucide-react';
import type { ReactNode } from 'react';

import { useMe } from '@/hooks/users/useMe';
import { useAuthModal } from '@/components/auth/useAuthModal';
import { Header } from '@/components/common';

interface ConsumerHeaderProps {
  slot?: ReactNode;
}

export function ConsumerHeader({ slot }: ConsumerHeaderProps) {
  const { openAuthModal } = useAuthModal();
  const { data: user = null } = useMe();

  const guestMenuItems = [
    {
      label: '판매자센터',
      type: 'link' as const,
      href: '/seller',
      icon: <Store className="size-5" aria-hidden="true" />,
    },
    {
      label: '로그인',
      type: 'action' as const,
      onClick: () => openAuthModal('login'),
      icon: <User className="size-5" aria-hidden="true" />,
    },
  ];

  const userMenuItems = [
    {
      label: '판매자센터',
      type: 'link' as const,
      href: '/seller',
    },
    {
      label: '마이페이지',
      type: 'link' as const,
      href: '/mypage',
    },
  ];

  return (
    <Header
      user={user}
      logoHref="/"
      slot={slot}
      menuItems={user ? userMenuItems : guestMenuItems}
    />
  );
}
