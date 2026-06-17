'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { useRoleGuard } from '@/hooks/auth/useRoleGuard';
import { useSignOut } from '@/hooks/auth/useSignOut';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuthModal } from '@/components/auth/useAuthModal';
import { Header } from '@/components/common/Header/Header';
import { Sidebar } from '@/components/common/Sidebar/Sidebar';
import { sellerSidebarSections } from '@/components/seller/sellerSidebarSections';

const SELLER_MANAGEMENT_PREFIXES = [
  '/seller/dashboard',
  '/seller/products',
  '/seller/orders',
  '/seller/store',
  '/seller/menu',
];

function isManagementPath(pathname: string): boolean {
  return SELLER_MANAGEMENT_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isManagement = isManagementPath(pathname);
  const guard = useRoleGuard('seller', isManagement);
  const { openAuthModal } = useAuthModal();
  const { mutate: signOut } = useSignOut();

  useEffect(() => {
    if (guard.status === 'loading') return;

    if (guard.status === 'unauthorized') {
      const next = encodeURIComponent(
        window.location.pathname + window.location.search
      );
      router.push(`/seller?auth=required&next=${next}`);
      return;
    }

    if (guard.status === 'forbidden') {
      router.push('/seller');
    }
  }, [guard.status, router]);

  if (guard.status === 'loading' && isManagement) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-sm text-gray-500">로딩 중...</span>
      </div>
    );
  }

  if (guard.status === 'unauthorized' || guard.status === 'forbidden') {
    return null;
  }

  if (guard.status === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <span className="text-sm text-gray-500">
          오류가 발생했습니다. 잠시 후 다시 시도해주세요.
        </span>
        <button
          type="button"
          onClick={() => void guard.refetch()}
          className="rounded-sm border border-gray-300 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const user = guard.status === 'ok' ? guard.user : undefined;
  const sellerUser = user?.role === 'seller' ? user : undefined;

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        user={user ?? null}
        logoHref="/seller"
        sidebarSections={sellerUser ? sellerSidebarSections : undefined}
        menuItems={
          user
            ? [
                {
                  label: '소비자 센터',
                  type: 'link',
                  href: '/',
                },
                {
                  label: '로그아웃',
                  type: 'action',
                  onClick: () =>
                    signOut(undefined, {
                      onSuccess: () => router.push('/seller'),
                    }),
                  className: 'text-red-500',
                },
              ]
            : [
                {
                  label: '로그인',
                  type: 'action',
                  onClick: () =>
                    openAuthModal(
                      'login',
                      window.location.pathname + window.location.search
                    ),
                },
              ]
        }
      />
      <div className="flex flex-1">
        {sellerUser && (
          <div className="hidden pt-4 lg:block">
            <Sidebar sections={sellerSidebarSections} />
          </div>
        )}
        <main className="flex-1 bg-gray-50 p-4 lg:p-8">{children}</main>
      </div>
      <AuthModal />
    </div>
  );
}
