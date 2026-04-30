import type { NextRequest } from 'next/server';
import { z } from 'zod';

import type { CreateOrderRequest } from '@/contracts/order';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { fail, routeError, success } from '@/app/api/_lib/response';
import { validateBody } from '@/app/api/_lib/validation';
import { mockCreatedOrder, mockOrderList } from '@/mocks/orders';

const createOrderSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  pickupAt: z.string().datetime(),
}) satisfies z.ZodType<CreateOrderRequest>;

export async function GET(): Promise<Response> {
  if (!isApiMockEnabled()) {
    return fail(ERROR_CODE.NOT_IMPLEMENTED);
  }

  return success(mockOrderList);
}

export async function POST(request: NextRequest): Promise<Response> {
  if (!isApiMockEnabled()) {
    return fail(ERROR_CODE.NOT_IMPLEMENTED);
  }

  try {
    await validateBody(createOrderSchema, request);
    return success(mockCreatedOrder, 201);
  } catch (error) {
    return routeError(error);
  }
}
