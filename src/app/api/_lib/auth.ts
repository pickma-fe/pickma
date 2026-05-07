import type { User } from '@supabase/supabase-js';

import type { UserResponse } from '@/contracts/user';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServerClient } from '@/lib/supabase/server';
import { getOrCreateUserByAuthUser } from '@/app/api/_lib/current-user';

export async function requireAuth() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AppError(ERROR_CODE.UNAUTHORIZED, 401);
  }
  return user;
}

export async function requireActiveUser(): Promise<{
  authUser: User;
  serviceUser: UserResponse;
}> {
  const supabase = await createServerClient();
  const authUser = await requireAuth();
  const serviceUser = await getOrCreateUserByAuthUser(supabase, authUser);

  if (serviceUser.status !== 'active') {
    throw new AppError(ERROR_CODE.FORBIDDEN, 403);
  }

  return { authUser, serviceUser };
}

export async function requireSeller() {
  // Phase 4에서 DB role 조회로 보강
  return requireAuth();
}

export async function requireAdmin() {
  // Phase 4에서 DB role 조회로 보강
  return requireAuth();
}
