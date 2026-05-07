import type { UserResponse } from '@/contracts/user';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { mapUserRow } from '@/app/api/users/_lib/mapper';

import type { UpdateMeBody } from './schemas';

export async function updateUser(
  userId: string,
  data: UpdateMeBody
): Promise<UserResponse> {
  const supabase = createServiceRoleClient();

  const { data: updated, error } = await supabase
    .from('users')
    .update(data)
    .eq('id', userId)
    .select('*')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new AppError(ERROR_CODE.NOT_FOUND, 404);
    }
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  if (!updated) {
    throw new AppError(ERROR_CODE.NOT_FOUND, 404);
  }

  return mapUserRow(updated);
}
