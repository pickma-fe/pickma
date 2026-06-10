'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useRoleGuard } from '@/hooks/auth/useRoleGuard';
import { useSignOut } from '@/hooks/auth/useSignOut';
import { adminSidebarSections } from '@/components/admin/adminSidebarSections';
import { Header } from '@/components/common/Header/Header';
import { Sidebar } from '@/components/common/Sidebar/Sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const guard = useRoleGuard('admin');
  const router = useRouter();
  const { mutateAsync: signOut } = useSignOut();

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  useEffect(() => {
    if (guard.status === 'loading') return;

    if (guard.status === 'unauthorized') {
      const next = encodeURIComponent(
        window.location.pathname + window.location.search
      );
      router.push(`/?auth=required&next=${next}`);
      return;
    }

    if (guard.status === 'forbidden') {
      router.push('/');
    }
  }, [guard.status, router]);

  if (guard.status === 'loading') {
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

  const user = guard.user;
  if (!user) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        user={user}
        logoHref="/admin"
        menuItems={[
          {
            label: '로그아웃',
            type: 'action',
            onClick: () => void handleSignOut(),
          },
        ]}
      />
      <div className="flex flex-1">
        <div className="hidden pt-4 lg:block">
          <Sidebar sections={adminSidebarSections} />
        </div>
        <main className="flex-1 bg-gray-50 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
