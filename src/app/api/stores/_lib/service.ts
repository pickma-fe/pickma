import type {
  StoreResponse,
  CreateStoreRequest,
  UpdateStoreRequest,
} from '@/contracts/store';
import type { UserResponse } from '@/contracts/user';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServerClient } from '@/lib/supabase/server';
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
      status: 'active' as const,
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

  return mapStoreRow(row, true);
}

export async function updateMyStore(
  userId: string,
  userRole: UserResponse['role'],
  body: UpdateStoreRequest
): Promise<StoreResponse> {
  const supabase = await createServerClient();

  const isChangingOperationStatus = body.operationStatus !== undefined;

  const baseQuery = supabase
    .from('stores')
    .update({
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.phone !== undefined && { phone: body.phone }),
      ...(body.address !== undefined && { address: body.address }),
      ...(body.addressDetail !== undefined && {
        address_detail: body.addressDetail,
      }),
      ...(body.region !== undefined && { region: body.region }),
      ...(body.image !== undefined && { image: body.image }),
      ...(body.openTime !== undefined && {
        open_time: body.openTime.slice(0, 8),
      }),
      ...(body.closeTime !== undefined && {
        close_time: body.closeTime.slice(0, 8),
      }),
      ...(isChangingOperationStatus && {
        operation_status: body.operationStatus,
      }),
    })
    .eq('user_id', userId);

  const filteredQuery = isChangingOperationStatus
    ? baseQuery.eq('status', 'active')
    : baseQuery;

  const { data: row, error } = await filteredQuery.select('*').single();

  if (error) {
    if (isChangingOperationStatus && error.code === 'PGRST116') {
      const { data: existing, error: fetchError } = await supabase
        .from('stores')
        .select('status')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
      if (!existing) throw new AppError(ERROR_CODE.STORE_NOT_FOUND, 404);
      throw new AppError(ERROR_CODE.STORE_INACTIVE, 403);
    }
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }
  if (!row) throw new AppError(ERROR_CODE.STORE_NOT_FOUND, 404);

  const canSell =
    userRole === 'seller' &&
    row.status === 'active' &&
    row.operation_status === 'open';
  return mapStoreRow(row, canSell);
}

export async function getMyStore(
  userId: string,
  userRole: UserResponse['role']
): Promise<StoreResponse> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  if (data === null) throw new AppError(ERROR_CODE.STORE_NOT_FOUND, 404);

  const canSell =
    userRole === 'seller' &&
    data.status === 'active' &&
    data.operation_status === 'open';
  return mapStoreRow(data, canSell);
}
