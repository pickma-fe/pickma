import type { NextRequest } from 'next/server';

import { requireActiveUser } from '@/app/api/_lib/auth';
import { routeError, success } from '@/app/api/_lib/response';
import { validateBody } from '@/app/api/_lib/validation';
import { expireUserOrders } from '@/app/api/orders/_lib/service';

import { preparePaymentSchema } from '../_lib/schemas';
import { preparePayment } from '../_lib/service';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await validateBody(preparePaymentSchema, request);
    const { serviceUser } = await requireActiveUser();
    await expireUserOrders(serviceUser.id);
    const successUrl = `${request.nextUrl.origin}/payment/success`;
    const result = await preparePayment(serviceUser.id, body, successUrl);
    return success(result);
  } catch (error) {
    return routeError(error);
  }
}
