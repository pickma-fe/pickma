import type { NextRequest } from 'next/server';

import { requireActiveUser } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { routeError, success } from '@/app/api/_lib/response';
import { validateBody, validateQuery } from '@/app/api/_lib/validation';
import { mockCreatedOrder, mockOrderList } from '@/mocks/orders';

import { createOrderSchema, orderListQuerySchema } from './_lib/schemas';
import { createOrder, expireUserOrders, getOrders } from './_lib/service';

export async function GET(request: NextRequest): Promise<Response> {
  if (isApiMockEnabled()) return success(mockOrderList);
  try {
    const params = validateQuery(
      orderListQuerySchema,
      request.nextUrl.searchParams
    );
    const { serviceUser } = await requireActiveUser();
    const data = await getOrders(serviceUser.id, params);
    return success(data);
  } catch (error) {
    return routeError(error);
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    if (isApiMockEnabled()) {
      await validateBody(createOrderSchema, request);
      return success(mockCreatedOrder, 201);
    }

    const body = await validateBody(createOrderSchema, request);
    const { serviceUser } = await requireActiveUser();
    await expireUserOrders(serviceUser.id);
    const result = await createOrder(serviceUser.id, body);
    return success(result, 201);
  } catch (error) {
    return routeError(error);
  }
}
