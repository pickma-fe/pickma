import type { User } from '@supabase/supabase-js';

import type { UserResponse } from '@/contracts/user';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServerClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { getOrCreateUserByAuthUser } from '@/app/api/_lib/current-user';

type EligibilityResult =
  | { eligible: true }
  | {
      eligible: false;
      reason: 'seller_already_registered' | 'application_already_submitted';
    };

export async function checkApplicationEligibility(
  userId: string,
  role: string
): Promise<EligibilityResult> {
  if (role === 'seller') {
    return { eligible: false, reason: 'seller_already_registered' };
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('seller_applications')
    .select('id')
    .eq('user_id', userId)
    .in('status', ['pending', 'approved'])
    .limit(1);

  if (error) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  if (data && data.length > 0) {
    return { eligible: false, reason: 'application_already_submitted' };
  }

  return { eligible: true };
}

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

type RequireSellerResult = {
  authUser: User;
  serviceUser: UserResponse;
  store: { id: string };
};

export async function requireSeller(): Promise<RequireSellerResult> {
  const { authUser, serviceUser } = await requireActiveUser();

  if (serviceUser.role !== 'seller') {
    throw new AppError(ERROR_CODE.FORBIDDEN, 403);
  }

  const supabase = await createServerClient();
  const { data: store, error } = await supabase
    .from('stores')
    .select('id, status')
    .eq('user_id', serviceUser.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new AppError(ERROR_CODE.STORE_NOT_FOUND, 404);
    }
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  if (!store) {
    throw new AppError(ERROR_CODE.STORE_NOT_FOUND, 404);
  }

  if (store.status !== 'approved') {
    throw new AppError(ERROR_CODE.STORE_NOT_APPROVED, 403);
  }

  return { authUser, serviceUser, store: { id: store.id } };
}

export async function requireAdmin(): Promise<{
  authUser: User;
  serviceUser: UserResponse;
}> {
  const { authUser, serviceUser } = await requireActiveUser();

  if (serviceUser.role !== 'admin') {
    throw new AppError(ERROR_CODE.FORBIDDEN, 403);
  }

  return { authUser, serviceUser };
}
