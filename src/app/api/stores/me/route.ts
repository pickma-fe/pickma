import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireActiveUser } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { fail, routeError, success } from '@/app/api/_lib/response';
import { mockMyStore } from '@/mocks/stores';

import { getMyStore } from '../_lib/service';

export async function GET(): Promise<Response> {
  try {
    if (isApiMockEnabled()) {
      return success(mockMyStore);
    }
    const { serviceUser } = await requireActiveUser();
    const store = await getMyStore(serviceUser.id, serviceUser.role);
    return success(store);
  } catch (error) {
    return routeError(error);
  }
}

export async function PATCH(): Promise<Response> {
  return fail(ERROR_CODE.NOT_IMPLEMENTED);
}
