import { requireActiveUser } from '@/app/api/_lib/auth';
import { routeError, success } from '@/app/api/_lib/response';

import { toSellerOnboardingStatusResponse } from './_lib/mapper';
import { getSellerOnboardingStatus } from './_lib/service';

export async function GET(): Promise<Response> {
  try {
    const { authUser } = await requireActiveUser();
    const data = await getSellerOnboardingStatus(authUser.id);
    return success(toSellerOnboardingStatusResponse(data));
  } catch (error) {
    return routeError(error);
  }
}
