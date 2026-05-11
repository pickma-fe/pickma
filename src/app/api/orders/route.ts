import type { NextRequest } from 'next/server';

import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { fail, routeError, success } from '@/app/api/_lib/response';
import { validateBody } from '@/app/api/_lib/validation';
import { mockCreatedOrder, mockOrderList } from '@/mocks/orders';

import { createOrderSchema } from './_lib/schemas';

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
