import type { NextRequest } from 'next/server';
import { z } from 'zod';

import type { ConfirmPaymentRequest } from '@/contracts/payment';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { fail, routeError, success } from '@/app/api/_lib/response';
import { validateBody } from '@/app/api/_lib/validation';
import { mockPaymentConfirmResult } from '@/mocks/payments';

const confirmPaymentSchema = z.object({
  provider: z.enum(['toss', 'kakao_pay', 'naver_pay']),
  orderNumber: z.string().min(1),
  amount: z.number().int().positive(),
}) satisfies z.ZodType<ConfirmPaymentRequest>;

export async function POST(request: NextRequest): Promise<Response> {
  if (!isApiMockEnabled()) {
    return fail(ERROR_CODE.NOT_IMPLEMENTED);
  }

  try {
    await validateBody(confirmPaymentSchema, request);
    return success(mockPaymentConfirmResult);
  } catch (error) {
    return routeError(error);
  }
}
