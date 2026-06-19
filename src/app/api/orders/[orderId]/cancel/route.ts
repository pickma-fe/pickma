import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireActiveUser } from '@/app/api/_lib/auth';
import { createLogger, generateReqId } from '@/app/api/_lib/logger';
import { fail, routeError, success } from '@/app/api/_lib/response';

import { cancelOrderSchema, orderIdSchema } from '../../_lib/schemas';
import { cancelOrder } from '../../_lib/service';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
): Promise<Response> {
  const reqId = generateReqId();
  const logger = createLogger(reqId);
  const { orderId } = await params;

  try {
    const { authUser: user } = await requireActiveUser();

    const idParsed = orderIdSchema.safeParse(orderId);
    if (!idParsed.success) {
      return fail(ERROR_CODE.VALIDATION_ERROR, 400, [
        { path: 'orderId', message: idParsed.error.issues[0].message },
      ]);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return fail(ERROR_CODE.VALIDATION_ERROR, 400);
    }

    const bodyParsed = cancelOrderSchema.safeParse(body);
    if (!bodyParsed.success) {
      return fail(ERROR_CODE.VALIDATION_ERROR, 400, [
        { path: 'reason', message: bodyParsed.error.issues[0].message },
      ]);
    }

    await cancelOrder(user.id, idParsed.data, bodyParsed.data.reason, logger);
    const res = success(undefined);
    res.headers.set('X-Request-Id', reqId);
    return res;
  } catch (error) {
    return routeError(error);
  }
}
