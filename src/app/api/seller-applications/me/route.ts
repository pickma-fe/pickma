import { requireActiveUser } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { routeError, success } from '@/app/api/_lib/response';
import { mockSellerApplication } from '@/mocks/seller';

import {
  cancelMySellerApplication,
  getMySellerApplication,
} from './_lib/service';

export async function GET(): Promise<Response> {
  try {
    if (isApiMockEnabled()) {
      return success(mockSellerApplication);
    }

    const { authUser } = await requireActiveUser();
    const data = await getMySellerApplication(authUser.id);
    return success(data);
  } catch (error) {
    return routeError(error);
  }
}

export async function DELETE(): Promise<Response> {
  try {
    if (isApiMockEnabled()) {
      return success(null);
    }

    const { authUser } = await requireActiveUser();
    await cancelMySellerApplication(authUser.id);
    return success(null);
  } catch (error) {
    return routeError(error);
  }
}
