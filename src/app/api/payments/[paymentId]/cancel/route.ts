import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireAdmin } from '@/app/api/_lib/auth';
import { createLogger, generateReqId } from '@/app/api/_lib/logger';
import { fail, routeError, success } from '@/app/api/_lib/response';

import { cancelPaymentSchema, paymentIdSchema } from '../../_lib/schemas';
import { cancelPaymentById } from '../../_lib/service';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ paymentId: string }> }
): Promise<Response> {
  const reqId = generateReqId();
  const logger = createLogger(reqId);
  const { paymentId } = await params;

  try {
    await requireAdmin();

    const idParsed = paymentIdSchema.safeParse(paymentId);
    if (!idParsed.success) {
      return fail(ERROR_CODE.VALIDATION_ERROR, 400, [
        { path: 'paymentId', message: idParsed.error.issues[0].message },
      ]);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return fail(ERROR_CODE.VALIDATION_ERROR, 400);
    }

    const bodyParsed = cancelPaymentSchema.safeParse(body);
    if (!bodyParsed.success) {
      return fail(ERROR_CODE.VALIDATION_ERROR, 400, [
        { path: 'reason', message: bodyParsed.error.issues[0].message },
      ]);
    }

    await cancelPaymentById(idParsed.data, bodyParsed.data.reason, logger);
    const res = success(undefined);
    res.headers.set('X-Request-Id', reqId);
    return res;
  } catch (error) {
    return routeError(error);
  }
}
