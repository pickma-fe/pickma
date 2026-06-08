import { z } from 'zod';

import type {
  AdminProductListQuery,
  AdminProductListResponse,
  AdminProductResponse,
} from '@/contracts/admin';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';

const adminProductRowSchema = z.object({
  id: z.string(),
  store_id: z.string(),
  menu_item_id: z.string(),
  category_id: z.string().nullable(),
  discount_price: z.number(),
  original_price: z.number(),
  discount_rate: z.number(),
  available_stock: z.number(),
  stock: z.number(),
  reserved_stock: z.number(),
  end_at: z.string(),
  pickup_start_time: z.string(),
  pickup_end_time: z.string(),
  status: z.enum(['active', 'closed']),
  updated_at: z.string(),
  menu_items: z.object({
    id: z.string(),
    name: z.string(),
    image: z.string().nullable(),
  }),
  categories: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable(),
  stores: z.object({
    id: z.string(),
    name: z.string(),
  }),
});

type AdminProductRow = z.infer<typeof adminProductRowSchema>;

const ADMIN_PRODUCT_SELECT = [
  'id',
  'store_id',
  'menu_item_id',
  'category_id',
  'discount_price',
  'original_price',
  'discount_rate',
  'available_stock',
  'stock',
  'reserved_stock',
  'end_at',
  'pickup_start_time',
  'pickup_end_time',
  'status',
  'updated_at',
  'menu_items!inner(id, name, image)',
  'categories(id, name)',
  'stores!inner(id, name)',
].join(', ');

function toDisplayStatus(
  status: AdminProductResponse['status'],
  isSoldOut: boolean,
  isExpired: boolean
): AdminProductResponse['displayStatus'] {
  if (status === 'closed') return 'closed';
  if (isExpired) return 'expired';
  if (isSoldOut) return 'soldOut';
  return 'available';
}

function mapAdminProductRow(row: AdminProductRow): AdminProductResponse {
  const isSoldOut = row.available_stock <= 0;
  const isExpired = new Date(row.end_at) <= new Date();

  return {
    id: row.id,
    storeId: row.store_id,
    storeName: row.stores.name,
    categoryId: row.categories?.id,
    categoryName: row.categories?.name,
    menuItemId: row.menu_items.id,
    name: row.menu_items.name,
    image: row.menu_items.image ?? undefined,
    originalPrice: row.original_price,
    discountPrice: row.discount_price,
    discountRate: row.discount_rate,
    stock: row.stock,
    reservedStock: row.reserved_stock,
    availableStock: row.available_stock,
    isSoldOut,
    isExpired,
    displayStatus: toDisplayStatus(row.status, isSoldOut, isExpired),
    endAt: row.end_at,
    pickupStartTime: row.pickup_start_time,
    pickupEndTime: row.pickup_end_time,
    status: row.status,
    updatedAt: row.updated_at,
  };
}

function parseAdminProductRows(value: unknown): AdminProductRow[] {
  const result = z.array(adminProductRowSchema).safeParse(value);

  if (!result.success) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  return result.data;
}

function escapePostgrestLikeValue(value: string): string {
  return value
    .replace(/[,*()]/g, ' ')
    .replace(/[%_]/g, '\\$&')
    .trim();
}

async function getKeywordMatchedIds(keyword: string): Promise<{
  menuItemIds: string[];
  storeIds: string[];
}> {
  const supabase = createServiceRoleClient();
  const searchValue = escapePostgrestLikeValue(keyword);

  if (searchValue.length === 0) {
    return { menuItemIds: [], storeIds: [] };
  }

  const [menuItemResult, storeResult] = await Promise.all([
    supabase.from('menu_items').select('id').ilike('name', `%${searchValue}%`),
    supabase.from('stores').select('id').ilike('name', `%${searchValue}%`),
  ]);

  if (menuItemResult.error || storeResult.error) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  return {
    menuItemIds: (menuItemResult.data ?? []).map((item) => item.id),
    storeIds: (storeResult.data ?? []).map((store) => store.id),
  };
}

export async function getAdminProducts(
  query: AdminProductListQuery
): Promise<AdminProductListResponse> {
  const supabase = createServiceRoleClient();
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 20;
  const offset = (page - 1) * pageSize;

  let productsQuery = supabase
    .from('products')
    .select(ADMIN_PRODUCT_SELECT, { count: 'exact' })
    .order('updated_at', { ascending: false });

  if (query.status) {
    productsQuery = productsQuery.eq('status', query.status);
  }

  if (query.storeId) {
    productsQuery = productsQuery.eq('store_id', query.storeId);
  }

  if (query.keyword) {
    const { menuItemIds, storeIds } = await getKeywordMatchedIds(query.keyword);
    const filters = [
      ...menuItemIds.map((id) => `menu_item_id.eq.${id}`),
      ...storeIds.map((id) => `store_id.eq.${id}`),
    ];

    if (filters.length === 0) {
      return {
        items: [],
        page,
        pageSize,
        totalCount: 0,
        totalPages: 0,
      };
    }

    productsQuery = productsQuery.or(filters.join(','));
  }

  const { data, error, count } = await productsQuery.range(
    offset,
    offset + pageSize - 1
  );

  if (error) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  const totalCount = count ?? 0;

  const rows = parseAdminProductRows(data ?? []);

  return {
    items: rows.map(mapAdminProductRow),
    page,
    pageSize,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}
