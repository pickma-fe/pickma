'use client';

import { Store, User } from 'lucide-react';
import type { ReactNode } from 'react';

import { useAuthModal } from '@/components/auth/useAuthModal';
import { Header } from '@/components/common';

interface ConsumerHeaderProps {
  slot?: ReactNode;
}

export function ConsumerHeader({ slot }: ConsumerHeaderProps) {
  const { openAuthModal } = useAuthModal();

  return (
    <Header
      user={null}
      logoHref="/"
      slot={slot}
      menuItems={[
        {
          label: '판매자센터',
          type: 'link',
          href: '/seller',
          icon: <Store className="size-5" aria-hidden="true" />,
        },
        {
          label: '로그인',
          type: 'action',
          onClick: () => openAuthModal('login'),
          icon: <User className="size-5" aria-hidden="true" />,
        },
      ]}
    />
  );
}
