import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { createProxyClient } from '@/lib/supabase/proxy';

const CONSUMER_PROTECTED = ['/order', '/payment', '/mypage'];
// const SELLER_PROTECTED = [
//   '/seller/register',
//   '/seller/pending',
//   '/seller/dashboard',
//   '/seller/products',
//   '/seller/orders',
//   '/seller/store',
// ];
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

  if (matchesAnyPrefix(pathname, ADMIN_PROTECTED)) {
    if (!user) {
      return NextResponse.redirect(
        new URL(`/?auth=required&next=${next}`, request.url)
      );
    }
    // Phase 3: DB role check for admin
  }

  // if (matchesAnyPrefix(pathname, SELLER_PROTECTED)) {
  //   if (!user) {
  //     return NextResponse.redirect(
  //       new URL(`/seller?auth=required&next=${next}`, request.url)
  //     );
  //   }
  //   // Phase 3: store approval check for seller dashboard routes
  // }

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
