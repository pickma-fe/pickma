'use client';

import { Header, Sidebar } from '@/components/common';

import { sellerSidebarSections } from './_components/sellerSidebarSections';

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header
        user={null}
        logoHref="/seller"
        menuItems={[{ label: '로그인', type: 'link', href: '/login' }]}
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
