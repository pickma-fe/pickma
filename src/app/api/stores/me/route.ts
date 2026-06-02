import type { NextRequest } from 'next/server';

import { requireSeller } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { routeError, success } from '@/app/api/_lib/response';
import { validateBody } from '@/app/api/_lib/validation';
import { mockMyStore } from '@/mocks/stores';

import { updateStoreSchema } from '../_lib/schemas';
import { getMyStore, updateMyStore } from '../_lib/service';

export async function GET(): Promise<Response> {
  try {
    if (isApiMockEnabled()) {
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
