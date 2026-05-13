import type { NextRequest } from 'next/server';

import { requireActiveUser } from '@/app/api/_lib/auth';
import { routeError, success } from '@/app/api/_lib/response';
import { validateBody } from '@/app/api/_lib/validation';
import { expireUserOrders } from '@/app/api/orders/_lib/service';

import { confirmPaymentSchema } from '../_lib/schemas';
import { confirmPayment } from '../_lib/service';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await validateBody(confirmPaymentSchema, request);
    const { serviceUser } = await requireActiveUser();
    await expireUserOrders(serviceUser.id);
    await confirmPayment(serviceUser.id, body);
    return success(undefined);
  } catch (error) {
    return routeError(error);
  }
}
