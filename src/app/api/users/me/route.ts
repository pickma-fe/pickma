import type { NextRequest } from 'next/server';

import { requireActiveUser } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { routeError, success } from '@/app/api/_lib/response';
import { validateBody } from '@/app/api/_lib/validation';
import { mockAdminUser, mockUser } from '@/mocks/users';

import { updateMeSchema } from './_lib/schemas';
import { updateUser } from './_lib/service';

export async function GET(request: NextRequest): Promise<Response> {
  if (isApiMockEnabled()) {
    const mockUserCookie = request.cookies.get('mock_user')?.value;
    return success(mockUserCookie === 'admin' ? mockAdminUser : mockUser);
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
      const mockUserCookie = req.cookies.get('mock_user')?.value;
      const currentMockUser =
        mockUserCookie === 'admin' ? mockAdminUser : mockUser;
      return success({ ...currentMockUser, ...data });
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
