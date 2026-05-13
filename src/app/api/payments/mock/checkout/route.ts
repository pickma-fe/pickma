import type { NextRequest } from 'next/server';

import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { fail } from '@/app/api/_lib/response';

export async function GET(request: NextRequest): Promise<Response> {
  if (!isApiMockEnabled()) {
    return fail(ERROR_CODE.NOT_FOUND, 404);
  }

  const orderNumber = request.nextUrl.searchParams.get('orderNumber');
  if (!orderNumber) {
    return fail(ERROR_CODE.VALIDATION_ERROR, 400);
  }

  const html = `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><title>Mock 결제</title></head>
<body>
  <h1>Mock 결제 페이지</h1>
  <p>주문번호: <strong>${orderNumber}</strong></p>
  <p>이 페이지는 <code>API_MOCK_ENABLED=true</code> 환경에서만 동작합니다.</p>
  <p>실제 결제 없이 confirm API를 직접 호출해 결제 흐름을 검증하세요.</p>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
