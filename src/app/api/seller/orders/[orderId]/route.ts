import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireSellerStore } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { fail, routeError, success } from '@/app/api/_lib/response';
import { mockSellerOrderDetailsMap } from '@/mocks/seller';

import { orderIdSchema } from '../_lib/schemas';
import { getSellerOrder } from '../_lib/service';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> }
): Promise<Response> {
  const { orderId } = await params;

  const parsed = orderIdSchema.safeParse(orderId);
  if (!parsed.success) {
    return fail(ERROR_CODE.VALIDATION_ERROR, 400, [
      { path: 'orderId', message: parsed.error.issues[0].message },
    ]);
  }

  if (isApiMockEnabled()) {
    const detail = mockSellerOrderDetailsMap[parsed.data];
    if (!detail) return fail(ERROR_CODE.ORDER_NOT_FOUND, 404);
    return success(detail);
  }

  try {
    const { store } = await requireSellerStore();
    const data = await getSellerOrder(store.id, parsed.data);
    return success(data);
  } catch (error) {
    return routeError(error);
  }
}
