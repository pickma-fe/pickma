import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';

import type { AuthProvider } from '@/types/auth';
import type { UserResponse } from '@/contracts/user';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireActiveUser } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { fail, routeError, success } from '@/app/api/_lib/response';
import { validateBody } from '@/app/api/_lib/validation';
import { mockAdminUser, mockUser } from '@/mocks/users';

import { updateMeSchema } from './_lib/schemas';
import { updateUser } from './_lib/service';

function getMockUser(req: NextRequest) {
  const cookie = req.cookies.get('mock_user')?.value;
  if (cookie === 'admin') return mockAdminUser;
  return mockUser;
}

function toAuthProvider(provider?: string): AuthProvider | undefined {
  if (provider === 'google' || provider === 'kakao' || provider === 'email') {
    return provider;
  }
  return undefined;
}

function withAuthProvider(
  user: UserResponse,
  authUser: SupabaseUser
): UserResponse {
  return {
    ...user,
    authProvider: toAuthProvider(authUser.app_metadata.provider),
  };
}

export async function GET(request: NextRequest): Promise<Response> {
  if (isApiMockEnabled()) {
    return success(getMockUser(request));
  }

  try {
    const { authUser, serviceUser } = await requireActiveUser();
    return success(withAuthProvider(serviceUser, authUser));
  } catch (e) {
    return routeError(e);
  }
}

export async function DELETE(): Promise<Response> {
  if (isApiMockEnabled()) return success(null);

  try {
    await requireActiveUser();
    return fail(ERROR_CODE.NOT_IMPLEMENTED);
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
    const { authUser, serviceUser } = await requireActiveUser();
    const data = await validateBody(updateMeSchema, req);
    const updated = await updateUser(serviceUser.id, data);
    return success(withAuthProvider(updated, authUser));
  } catch (e) {
    return routeError(e);
  }
}
