'use client';

import { useMe } from '@/hooks/users/useMe';
import { Header } from '@/components/common/Header/Header';
import { Sidebar } from '@/components/common/Sidebar/Sidebar';

import { sellerSidebarSections } from './_components/sellerSidebarSections';

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: user } = useMe();

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        user={user ?? null}
        logoHref="/seller"
        menuItems={
          user ? [] : [{ label: '로그인', type: 'link', href: '/login' }]
        }
      />
      <div className="flex flex-1">
        <div className="hidden pt-4 lg:block">
          <Sidebar sections={sellerSidebarSections} />
        </div>
        <main className="flex-1 bg-gray-50 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
