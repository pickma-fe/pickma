import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Suspense } from 'react';

import { AuthModal } from '@/components/auth/AuthModal';
import { AuthModalRouteSync } from '@/components/auth/AuthModalRouteSync';
import { MockUserSwitcher } from '@/components/dev/MockUserSwitcher';

import { Providers } from './providers';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'PickMa',
  description: '마감 임박 할인 상품을 예약하고 픽업하는 플랫폼',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          {children}
          <AuthModal />
          <Suspense fallback={null}>
            <AuthModalRouteSync />
          </Suspense>
          {process.env.NODE_ENV === 'development' && <MockUserSwitcher />}
        </Providers>
      </body>
    </html>
  );
}
