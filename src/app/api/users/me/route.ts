import type { NextRequest } from 'next/server';

import { createServerClient } from '@/lib/supabase/server';
import { requireActiveUser } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { routeError, success } from '@/app/api/_lib/response';
import { validateBody } from '@/app/api/_lib/validation';
import { mockUser } from '@/mocks/users';

import { updateMeSchema } from './_lib/schemas';
import { updateUser } from './_lib/service';

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

export async function PATCH(req: NextRequest): Promise<Response> {
  if (isApiMockEnabled()) {
    try {
      const data = await validateBody(updateMeSchema, req);
      return success({ ...mockUser, ...data });
    } catch (e) {
      return routeError(e);
    }
  }

  try {
    const { serviceUser } = await requireActiveUser();
    const data = await validateBody(updateMeSchema, req);
    const supabase = await createServerClient();
    const updated = await updateUser(supabase, serviceUser.id, data);
    return success(updated);
  } catch (e) {
    return routeError(e);
  }
}
