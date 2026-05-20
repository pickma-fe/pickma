import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireSellerStore } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { fail, routeError, success } from '@/app/api/_lib/response';

import { orderIdSchema } from '../../_lib/schemas';
import { completeSellerOrder } from '../../_lib/service';

export async function PATCH(
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

  if (isApiMockEnabled()) return success(undefined);

  try {
    const { store } = await requireSellerStore();
    await completeSellerOrder(store.id, parsed.data);
    return success(undefined);
  } catch (error) {
    return routeError(error);
  }
}
