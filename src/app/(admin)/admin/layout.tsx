'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { ApiError } from '@/api/apiClient';
import { useSignOut } from '@/hooks/auth/useSignOut';
import { useMe } from '@/hooks/users/useMe';
import { Header } from '@/components/common/Header/Header';
import { Sidebar } from '@/components/common/Sidebar/Sidebar';

import { adminSidebarSections } from './_components/adminSidebarSections';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: user, isLoading, isError, error } = useMe();
  const router = useRouter();
  const { mutateAsync: signOut } = useSignOut();

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  useEffect(() => {
    if (isLoading) return;

    if (isError) {
      if (
        error instanceof ApiError &&
        (error.statusCode === 401 || error.statusCode === 403)
      ) {
        router.push('/');
      }
      return;
    }

    if (user?.role !== 'admin') {
      router.push('/');
    }
  }, [isLoading, isError, error, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-sm text-gray-500">로딩 중...</span>
      </div>
    );
  }

  if (isError) {
    const isAuthError =
      error instanceof ApiError &&
      (error.statusCode === 401 || error.statusCode === 403);

    if (isAuthError) {
      return null;
    }

    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-sm text-gray-500">
          오류가 발생했습니다. 잠시 후 다시 시도해주세요.
        </span>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return null;
  }

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
