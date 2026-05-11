import type { StoreResponse, CreateStoreRequest } from '@/contracts/store';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';

import { mapStoreRow } from './mapper';

export async function createStore(
  userId: string,
  body: CreateStoreRequest
): Promise<StoreResponse> {
  const supabase = createServiceRoleClient();

  const { data: existing, error: checkError } = await supabase
    .from('stores')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (checkError) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  if (existing) throw new AppError(ERROR_CODE.STORE_ALREADY_EXISTS, 409);

  const { data: row, error: insertError } = await supabase
    .from('stores')
    .insert({
      user_id: userId,
      name: body.name,
      description: body.description ?? null,
      business_number: body.businessNumber,
      phone: body.phone,
      address: body.address,
      address_detail: body.addressDetail ?? null,
      region: body.region,
      image: body.image ?? null,
      open_time: body.openTime ? body.openTime.slice(0, 8) : null,
      close_time: body.closeTime ? body.closeTime.slice(0, 8) : null,
    })
    .select('*')
    .single();

  if (insertError) {
    if (insertError.code === '23505') {
      throw new AppError(ERROR_CODE.STORE_ALREADY_EXISTS, 409);
    }
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }
  if (!row) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);

  return mapStoreRow(row, false);
}
