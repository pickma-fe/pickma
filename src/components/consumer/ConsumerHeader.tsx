'use client';

import { Store, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { useSignOut } from '@/hooks/auth/useSignOut';
import { useMe } from '@/hooks/users/useMe';
import { useAuthModal } from '@/components/auth/useAuthModal';
import { Header } from '@/components/common';

interface ConsumerHeaderProps {
  slot?: ReactNode;
}

export function ConsumerHeader({ slot }: ConsumerHeaderProps) {
  const router = useRouter();
  const { openAuthModal } = useAuthModal();
  const { mutateAsync: signOut, isPending: isSignOutPending } = useSignOut();
  const { data: user = null } = useMe();

  async function handleSignOut() {
    await signOut();
    router.push('/');
    router.refresh();
  }

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
    ...(user?.role === 'admin'
      ? [
          {
            label: '관리자 페이지',
            type: 'link' as const,
            href: '/admin',
          },
        ]
      : []),
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
    {
      label: isSignOutPending ? '로그아웃 중' : '로그아웃',
      type: 'action' as const,
      onClick: () => void handleSignOut(),
      className: 'text-red-500 hover:bg-red-50 data-focus:bg-red-50',
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
