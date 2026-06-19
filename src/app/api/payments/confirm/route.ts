import type { NextRequest } from 'next/server';

import { requireActiveUser } from '@/app/api/_lib/auth';
import { createLogger, generateReqId } from '@/app/api/_lib/logger';
import { expireUserOrders } from '@/app/api/_lib/order-expiration';
import { routeError, success } from '@/app/api/_lib/response';
import { validateBody } from '@/app/api/_lib/validation';

import { confirmPaymentSchema } from '../_lib/schemas';
import { confirmPayment } from '../_lib/service';

export async function POST(request: NextRequest): Promise<Response> {
  const reqId = generateReqId();
  const logger = createLogger(reqId);
  try {
    const body = await validateBody(confirmPaymentSchema, request);
    const { serviceUser } = await requireActiveUser();
    await expireUserOrders();
    await confirmPayment(serviceUser.id, body, logger);
    const res = success(null);
    res.headers.set('X-Request-Id', reqId);
    return res;
  } catch (error) {
    return routeError(error);
  }
}
