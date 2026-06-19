import type { NextRequest } from 'next/server';

import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireSellerStore } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { fail, routeError, success } from '@/app/api/_lib/response';
import { validateBody } from '@/app/api/_lib/validation';

import { cancelSellerOrderSchema, orderIdSchema } from '../../_lib/schemas';
import { cancelSellerOrder } from '../../_lib/service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
): Promise<Response> {
  const { orderId } = await params;

  const parsed = orderIdSchema.safeParse(orderId);
  if (!parsed.success) {
    return fail(ERROR_CODE.VALIDATION_ERROR, 400, [
      { path: 'orderId', message: parsed.error.issues[0].message },
    ]);
  }

  try {
    const body = await validateBody(cancelSellerOrderSchema, request);

    if (isApiMockEnabled()) return success(undefined);

    const { store } = await requireSellerStore();
    await cancelSellerOrder(store.id, parsed.data, body.reason);
    return success(undefined);
  } catch (error) {
    return routeError(error);
  }
}
