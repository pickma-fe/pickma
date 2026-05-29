'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { type AuthModalView, useAuthModal } from './useAuthModal';

const VALID_VIEWS = new Set<AuthModalView>(['login', 'signup', 'reset']);

function toAuthModalView(raw: string | null): AuthModalView {
  if (raw && VALID_VIEWS.has(raw as AuthModalView)) return raw as AuthModalView;
  return 'login';
}

export function AuthModalRouteSync() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    const auth = searchParams.get('auth');
    const next = searchParams.get('next') ?? undefined;

    if (auth !== 'required') return;

    const view = toAuthModalView(searchParams.get('view'));
    openAuthModal(view, next);

    const params = new URLSearchParams(searchParams.toString());
    params.delete('auth');
    params.delete('next');
    params.delete('view');
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : window.location.pathname, { scroll: false });
  }, [searchParams, openAuthModal, router]);

  return null;
}
