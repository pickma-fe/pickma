import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { createProxyClient } from '@/lib/supabase/proxy';

const CONSUMER_PROTECTED = ['/order', '/payment', '/mypage'];
const SELLER_PROTECTED = [
  '/seller/register',
  '/seller/pending',
  '/seller/dashboard',
  '/seller/products',
  '/seller/orders',
  '/seller/store',
];
const ADMIN_PROTECTED = ['/admin'];

function matchesAnyPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.next({ request });
  const supabase = createProxyClient(request, response);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  const next = encodeURIComponent(pathname + search);

  const isMock = process.env.API_MOCK_ENABLED === 'true';

  if (!isMock && matchesAnyPrefix(pathname, ADMIN_PROTECTED)) {
    if (!user) {
      return NextResponse.redirect(
        new URL(`/?auth=required&next=${next}`, request.url)
      );
    }
    // Phase 4: DB role check는 Route Handler의 requireAdmin()에서 처리
  }

  if (matchesAnyPrefix(pathname, SELLER_PROTECTED)) {
    if (!user) {
      return NextResponse.redirect(
        new URL(`/seller?auth=required&next=${next}`, request.url)
      );
    }
    // Phase 4: store approval check는 Route Handler의 requireSeller()에서 처리
  }

  if (matchesAnyPrefix(pathname, CONSUMER_PROTECTED)) {
    if (!user) {
      return NextResponse.redirect(
        new URL(`/?auth=required&next=${next}`, request.url)
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
