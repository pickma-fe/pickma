import type { SupabaseClient, User } from '@supabase/supabase-js';

import type { UserResponse } from '@/contracts/user';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import type { Database } from '@/lib/supabase/database';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { mapUserRow } from '@/app/api/users/me/_lib/mapper';

export async function getOrCreateUserByAuthUser(
  supabase: SupabaseClient<Database>,
  authUser: User
): Promise<UserResponse> {
  if (!authUser.email) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  const { data: existing, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (existing) {
    return mapUserRow(existing);
  }

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  const name =
    (authUser.user_metadata?.full_name as string | undefined) ??
    (authUser.user_metadata?.name as string | undefined) ??
    authUser.email.split('@')[0];

  const serviceClient = createServiceRoleClient();
  const { data: created, error: upsertError } = await serviceClient
    .from('users')
    .upsert(
      { id: authUser.id, email: authUser.email, name },
      { onConflict: 'id' }
    )
    .select('*')
    .single();

  if (upsertError) {
    if (upsertError.code === '23505') {
      throw new AppError(ERROR_CODE.AUTH_IDENTITY_CONFLICT, 409);
    }
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  return mapUserRow(created);
}
