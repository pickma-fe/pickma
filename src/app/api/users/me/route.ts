import { createServerClient } from '@/lib/supabase/server';
import { requireActiveUser } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { routeError, success } from '@/app/api/_lib/response';
import { mockUser } from '@/mocks/users';

import { getUserMe } from './_lib/service';

export async function GET(): Promise<Response> {
  if (isApiMockEnabled()) {
    return success(mockUser);
  }

  try {
    const { authUser } = await requireActiveUser();
    const supabase = await createServerClient();
    const user = await getUserMe(supabase, authUser);
    return success(user);
  } catch (e) {
    return routeError(e);
  }
}
