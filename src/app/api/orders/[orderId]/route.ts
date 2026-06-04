import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireActiveUser } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { expireUserOrders } from '@/app/api/_lib/order-expiration';
import { fail, routeError, success } from '@/app/api/_lib/response';
import { mockOrderDetailsMap } from '@/mocks/orders';

import { orderIdSchema } from '../_lib/schemas';
import { getOrder } from '../_lib/service';

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
    const mockOrderDetail = mockOrderDetailsMap[parsed.data];

    if (!mockOrderDetail) {
      return fail(ERROR_CODE.ORDER_NOT_FOUND);
    }

    return success(mockOrderDetail);
  }

  try {
    const { serviceUser } = await requireActiveUser();
    await expireUserOrders(serviceUser.id);
    const data = await getOrder(serviceUser.id, parsed.data);
    return success(data);
  } catch (error) {
    return routeError(error);
  }
}
