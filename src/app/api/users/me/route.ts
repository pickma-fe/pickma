import type { NextRequest } from 'next/server';

import { requireActiveUser } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { routeError, success } from '@/app/api/_lib/response';
import { validateBody } from '@/app/api/_lib/validation';
import { mockAdminUser, mockUser } from '@/mocks/users';

import { updateMeSchema } from './_lib/schemas';
import { updateUser } from './_lib/service';

function getMockUser(req: NextRequest) {
  const cookie = req.cookies.get('mock_user')?.value;
  if (cookie === 'admin') return mockAdminUser;
  return mockUser;
}

export async function GET(request: NextRequest): Promise<Response> {
  if (isApiMockEnabled()) {
    return success(getMockUser(request));
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
      return success({ ...getMockUser(req), ...data });
    } catch (e) {
      return routeError(e);
    }
  }

  try {
    const { serviceUser } = await requireActiveUser();
    const data = await validateBody(updateMeSchema, req);
    const updated = await updateUser(serviceUser.id, data);
    return success(updated);
  } catch (e) {
    return routeError(e);
  }
}
