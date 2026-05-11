import type { NextRequest } from 'next/server';

import { requireActiveUser } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { routeError, success } from '@/app/api/_lib/response';
import { validateBody } from '@/app/api/_lib/validation';
import { mockPendingStore } from '@/mocks/stores';

import { createStoreSchema } from './_lib/schemas';
import { createStore } from './_lib/service';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    if (isApiMockEnabled()) {
      await validateBody(createStoreSchema, request);
      return success(mockPendingStore, 201);
    }

    const { serviceUser } = await requireActiveUser();
    const body = await validateBody(createStoreSchema, request);
    const store = await createStore(serviceUser.id, body);
    return success(store, 201);
  } catch (error) {
    return routeError(error);
  }
}
