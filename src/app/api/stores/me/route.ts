import type { NextRequest } from 'next/server';

import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireSeller } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { routeError, success } from '@/app/api/_lib/response';
import { validateBody } from '@/app/api/_lib/validation';
import { mockMyStore } from '@/mocks/stores';

import { updateStoreSchema } from '../_lib/schemas';
import { getMyStore, updateMyStore } from '../_lib/service';

export async function GET(request?: NextRequest): Promise<Response> {
  try {
    if (isApiMockEnabled()) {
      if (request?.cookies.get('mock_user')?.value === 'seller_no_store') {
        throw new AppError(ERROR_CODE.STORE_NOT_FOUND, 404);
      }
      return success(mockMyStore);
    }
    const { serviceUser } = await requireSeller();
    const store = await getMyStore(serviceUser.id, serviceUser.role);
    return success(store);
  } catch (error) {
    return routeError(error);
  }
}

export async function PATCH(request: NextRequest): Promise<Response> {
  try {
    const body = await validateBody(updateStoreSchema, request);

    if (isApiMockEnabled()) {
      const merged = { ...mockMyStore, ...body };
      const canSell =
        merged.status === 'active' && merged.operationStatus === 'open';
      return success({ ...merged, canSell });
    }

    const { serviceUser } = await requireSeller();
    const store = await updateMyStore(serviceUser.id, serviceUser.role, body);
    return success(store);
  } catch (error) {
    return routeError(error);
  }
}
