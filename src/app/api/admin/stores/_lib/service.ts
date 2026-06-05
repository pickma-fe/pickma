import type {
  AdminStoreListQuery,
  AdminStoreListResponse,
} from '@/contracts/admin';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';

import { toAdminStoreListResponse, toAdminStoreResponse } from './mapper';

const ADMIN_STORE_SELECT_COLUMNS =
  'id,user_id,name,description,business_number,phone,address,address_detail,region,image,status,operation_status,created_at,updated_at';

function escapePostgrestLikeValue(value: string): string {
  return value
    .replace(/[%,()]/g, ' ')
    .replace(/[_*]/g, '\\$&')
    .trim();
}

export async function getAdminStores(
  query: AdminStoreListQuery
): Promise<AdminStoreListResponse> {
  const supabase = createServiceRoleClient();

  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 20;
  const offset = (page - 1) * pageSize;
  const searchValue = query.keyword
    ? escapePostgrestLikeValue(query.keyword)
    : '';
  const regionValue = query.region
    ? escapePostgrestLikeValue(query.region)
    : '';

  let storesQuery = supabase
    .from('stores')
    .select(ADMIN_STORE_SELECT_COLUMNS, { count: 'exact' })
    .order('created_at', { ascending: false });

  if (query.status) {
    storesQuery = storesQuery.eq('status', query.status);
  }

  if (regionValue.length > 0) {
    storesQuery = storesQuery.ilike('region', `%${regionValue}%`);
  }

  if (searchValue.length > 0) {
    storesQuery = storesQuery.or(
      [
        `name.ilike.%${searchValue}%`,
        `business_number.ilike.%${searchValue}%`,
        `phone.ilike.%${searchValue}%`,
        `address.ilike.%${searchValue}%`,
      ].join(',')
    );
  }

  const { data, error, count } = await storesQuery.range(
    offset,
    offset + pageSize - 1
  );

  if (error) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  return toAdminStoreListResponse(
    (data ?? []).map(toAdminStoreResponse),
    count ?? 0,
    page,
    pageSize
  );
}
