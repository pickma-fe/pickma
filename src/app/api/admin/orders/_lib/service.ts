import type {
  AdminOrderListQuery,
  AdminOrderListResponse,
} from '@/contracts/admin';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { mapOrderListRow } from '@/app/api/_lib/order-mapper';

const ADMIN_ORDER_LIST_SELECT =
  'id, order_number, store_id, total_amount, discount_amount, payment_amount, status, pickup_at, pickup_service_date, store_order_number, pickup_number, expires_at, created_at, updated_at, stores(name)';

type ServiceRoleClient = ReturnType<typeof createServiceRoleClient>;

function escapePostgrestLikeValue(value: string): string {
  return value
    .replace(/[,*()]/g, ' ')
    .replace(/[%_]/g, '\\$&')
    .trim();
}

async function getKeywordMatchedStoreIds(
  supabase: ServiceRoleClient,
  keyword: string
): Promise<string[]> {
  const searchValue = escapePostgrestLikeValue(keyword);

  if (searchValue.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('stores')
    .select('id')
    .ilike('name', `%${searchValue}%`);

  if (error) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  return (data ?? []).map((store) => store.id);
}

export async function getAdminOrders(
  query: AdminOrderListQuery
): Promise<AdminOrderListResponse> {
  const supabase = createServiceRoleClient();
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 20;
  const offset = (page - 1) * pageSize;
  const searchValue = query.keyword
    ? escapePostgrestLikeValue(query.keyword)
    : '';

  let ordersQuery = supabase
    .from('orders')
    .select(ADMIN_ORDER_LIST_SELECT, { count: 'exact' });

  if (query.status) {
    ordersQuery = ordersQuery.eq('status', query.status);
  }

  if (searchValue.length > 0) {
    const storeIds = await getKeywordMatchedStoreIds(
      supabase,
      query.keyword ?? ''
    );
    ordersQuery = ordersQuery.or(
      [
        `order_number.ilike.%${searchValue}%`,
        `store_order_number.ilike.%${searchValue}%`,
        `pickup_number.ilike.%${searchValue}%`,
        ...storeIds.map((id) => `store_id.eq.${id}`),
      ].join(',')
    );
  }

  const { data, error, count } = await ordersQuery
    .order(query.sort === 'pickupAt' ? 'pickup_at' : 'created_at', {
      ascending: query.order === 'asc',
    })
    .range(offset, offset + pageSize - 1);

  if (error) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  const totalCount = count ?? 0;

  return {
    items: (data ?? []).map((row) => mapOrderListRow(row)),
    page,
    pageSize,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}
