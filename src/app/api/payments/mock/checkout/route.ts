import type { NextRequest } from 'next/server';

import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { fail } from '@/app/api/_lib/response';

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[char] ?? char;
  });
}

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = request.nextUrl;
  const orderNumber = searchParams.get('orderNumber');
  const provider = searchParams.get('provider');
  const amount = searchParams.get('amount');
  const successUrl = searchParams.get('successUrl');

  if (!orderNumber || !provider || !amount || !successUrl) {
    return fail(ERROR_CODE.VALIDATION_ERROR, 400);
  }

  const safeOrderNumber = escapeHtml(orderNumber);

  const callbackParams = new URLSearchParams({ orderNumber, provider, amount });
  const safeCallbackUrl = escapeHtml(
    `${successUrl}?${callbackParams.toString()}`
  );

  const html = `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><title>Mock 결제</title></head>
<body>
  <h1>Mock 결제 페이지</h1>
  <p>주문번호: <strong>${safeOrderNumber}</strong></p>
  <p>실제 provider 연동 전 결제 redirect 흐름을 검증하기 위한 페이지입니다.</p>
  <a href="${safeCallbackUrl}">결제하기</a>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
