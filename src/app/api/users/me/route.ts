import { requireActiveUser } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { routeError, success } from '@/app/api/_lib/response';
import { mockUser } from '@/mocks/users';

export async function GET(): Promise<Response> {
  if (isApiMockEnabled()) {
    return success(mockUser);
  }

  try {
    const { serviceUser } = await requireActiveUser();
    return success(serviceUser);
  } catch (e) {
    return routeError(e);
  }
}
