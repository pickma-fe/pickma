'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { useAuthModal } from './useAuthModal';

export function AuthModalRouteSync() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    const auth = searchParams.get('auth');
    const next = searchParams.get('next') ?? undefined;

    if (auth !== 'required') return;

    openAuthModal('login', next);

    const params = new URLSearchParams(searchParams.toString());
    params.delete('auth');
    params.delete('next');
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : window.location.pathname, { scroll: false });
  }, [searchParams, openAuthModal, router]);

  return null;
}
