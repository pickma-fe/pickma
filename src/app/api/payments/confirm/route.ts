import type { NextRequest } from 'next/server';

import { requireActiveUser } from '@/app/api/_lib/auth';
import { expireUserOrders } from '@/app/api/_lib/order-expiration';
import { routeError, success } from '@/app/api/_lib/response';
import { validateBody } from '@/app/api/_lib/validation';

import { confirmPaymentSchema } from '../_lib/schemas';
import { confirmPayment } from '../_lib/service';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await validateBody(confirmPaymentSchema, request);
    const { serviceUser } = await requireActiveUser();
    await expireUserOrders(serviceUser.id);
    await confirmPayment(serviceUser.id, body);
    return success(null);
  } catch (error) {
    return routeError(error);
  }
}
