import type { SupabaseClient } from '@supabase/supabase-js';

import type {
  ProductListItemResponse,
  ProductListParams,
  ProductListResponse,
} from '@/contracts/product';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import type { Database } from '@/lib/supabase/database';
import { createServiceRoleClient } from '@/lib/supabase/service';

import { mapProductRow, type ProductRow } from './mapper';

type OrderStatus = Database['public']['Enums']['order_status'];

const QUALIFIED_ORDER_STATUSES = [
  'reserved',
  'accepted',
  'ready',
  'completed',
] as const satisfies readonly OrderStatus[];
const POPULARITY_LOOKBACK_DAYS = 30;
const ORDER_HISTORY_LOOKBACK_DAYS = 90;
const VIEW_HISTORY_LOOKBACK_DAYS = 30;

type UserOrderHistoryRow = {
  product_id: string;
  quantity: number;
  orders: {
    created_at: string;
    status: string;
  } | null;
  products: {
    store_id: string;
    category_id: string | null;
  } | null;
};

type UserViewHistoryRow = {
  store_id: string;
  category_id: string | null;
  viewed_at: string;
};

type UserPreferenceProfile = {
  categoryScores: Map<string, number>;
  storeScores: Map<string, number>;
};

export async function getRankedProducts(
  supabase: SupabaseClient<Database>,
  params: ProductListParams,
  viewerUserId?: string
): Promise<ProductListResponse> {
  const { rows: candidateRows, totalCount } = await fetchCandidateProducts(
    supabase,
    params
  );
  const products = attachDistance(
    candidateRows.map(mapProductRow),
    params.userLat,
    params.userLng
  );
  const popularityScores = await getPopularityScores(
    products.map((product) => product.id)
  );

  if (params.sort === 'popular') {
    return paginateProducts(
      sortByPopularity(products, popularityScores),
      params,
      totalCount
    );
  }

  if (!viewerUserId) {
    return paginateProducts(
      sortByPopularity(products, popularityScores),
      params,
      totalCount
    );
  }

  const profile = await buildUserPreferenceProfile(viewerUserId);
  const hasProfileSignals =
    profile.categoryScores.size > 0 || profile.storeScores.size > 0;

  if (!hasProfileSignals) {
    return paginateProducts(
      sortByPopularity(products, popularityScores),
      params,
      totalCount
    );
  }

  const rankedProducts = [...products].sort((left, right) => {
    const rightScore = calculateRecommendationScore(
      right,
      profile,
      popularityScores.get(right.id) ?? 0
    );
    const leftScore = calculateRecommendationScore(
      left,
      profile,
      popularityScores.get(left.id) ?? 0
    );

    if (rightScore !== leftScore) {
      return rightScore - leftScore;
    }

    return compareTieBreakers(left, right, popularityScores);
  });

  return paginateProducts(rankedProducts, params, totalCount);
}

async function fetchCandidateProducts(
  supabase: SupabaseClient<Database>,
  params: ProductListParams
): Promise<{ rows: ProductRow[]; totalCount: number }> {
  const { categoryId, keyword } = params;

  let query = supabase
    .from('products')
    .select(
      [
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
        'menu_items!inner(id, name, description, image)',
        'categories(id, name)',
        'stores!inner(id, name, description, phone, address, address_detail, region, image, latitude, longitude)',
      ].join(', '),
      { count: 'exact' }
    )
    .eq('status', 'active')
    .eq('stores.status', 'active')
    .eq('stores.operation_status', 'open')
    .order('end_at', { ascending: true })
    .order('discount_rate', { ascending: false })
    .order('id', { ascending: true });

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  if (keyword) {
    query = query.ilike('menu_items.name', `%${escapeILikePattern(keyword)}%`);
  }

  if (params.minPrice !== undefined) {
    query = query.gte('discount_price', params.minPrice);
  }

  if (params.maxPrice !== undefined) {
    query = query.lt('discount_price', params.maxPrice);
  }

  if (params.availableOnly) {
    query = query.gt('end_at', new Date().toISOString());
  }

  if (params.discountOption && params.discountOption !== 'all') {
    if (params.discountOption === 'over-40') {
      query = query.gte('discount_rate', 40);
    } else if (params.discountOption === '30-to-40') {
      query = query.gte('discount_rate', 30).lt('discount_rate', 40);
    } else if (params.discountOption === '20-to-30') {
      query = query.gte('discount_rate', 20).lt('discount_rate', 30);
    } else if (params.discountOption === 'under-20') {
      query = query.lt('discount_rate', 20);
    }
  }

  const { data, error, count } = await query;

  if (error) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  return {
    rows: (data ?? []) as unknown as ProductRow[],
    totalCount: count ?? 0,
  };
}

async function getPopularityScores(
  productIds: string[]
): Promise<Map<string, number>> {
  const popularityScores = new Map<string, number>();

  if (productIds.length === 0) {
    return popularityScores;
  }

  const cutoffIso = daysAgoToIsoString(POPULARITY_LOOKBACK_DAYS);
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('order_items')
    .select('product_id, quantity, orders!inner(created_at, status)')
    .in('product_id', productIds)
    .gte('orders.created_at', cutoffIso)
    .in('orders.status', QUALIFIED_ORDER_STATUSES);

  if (error) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  for (const row of (data ?? []) as unknown as UserOrderHistoryRow[]) {
    popularityScores.set(
      row.product_id,
      (popularityScores.get(row.product_id) ?? 0) + row.quantity
    );
  }

  return popularityScores;
}

async function buildUserPreferenceProfile(
  viewerUserId: string
): Promise<UserPreferenceProfile> {
  const supabase = createServiceRoleClient();
  const categoryScores = new Map<string, number>();
  const storeScores = new Map<string, number>();
  const orderCutoffIso = daysAgoToIsoString(ORDER_HISTORY_LOOKBACK_DAYS);
  const viewCutoffIso = daysAgoToIsoString(VIEW_HISTORY_LOOKBACK_DAYS);

  const { data: orderHistory, error: orderHistoryError } = await supabase
    .from('order_items')
    .select(
      'product_id, quantity, orders!inner(created_at, status, user_id), products!inner(store_id, category_id)'
    )
    .eq('orders.user_id', viewerUserId)
    .gte('orders.created_at', orderCutoffIso)
    .in('orders.status', QUALIFIED_ORDER_STATUSES);

  if (orderHistoryError) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  for (const row of (orderHistory ?? []) as unknown as UserOrderHistoryRow[]) {
    if (!row.products || !row.orders) {
      continue;
    }

    const recencyWeight = getOrderRecencyWeight(row.orders.created_at);
    const quantityWeight = Math.max(1, Math.min(row.quantity, 3));

    if (row.products.category_id) {
      categoryScores.set(
        row.products.category_id,
        (categoryScores.get(row.products.category_id) ?? 0) +
          40 * recencyWeight * quantityWeight
      );
    }

    storeScores.set(
      row.products.store_id,
      (storeScores.get(row.products.store_id) ?? 0) +
        15 * recencyWeight * quantityWeight
    );
  }

  const { data: viewHistory, error: viewHistoryError } = await supabase
    .from('product_view_events')
    .select('store_id, category_id, viewed_at')
    .eq('user_id', viewerUserId)
    .gte('viewed_at', viewCutoffIso)
    .order('viewed_at', { ascending: false })
    .limit(100);

  if (viewHistoryError) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  for (const row of (viewHistory ?? []) as unknown as UserViewHistoryRow[]) {
    const recencyWeight = getViewRecencyWeight(row.viewed_at);

    if (row.category_id) {
      categoryScores.set(
        row.category_id,
        (categoryScores.get(row.category_id) ?? 0) + 20 * recencyWeight
      );
    }

    storeScores.set(
      row.store_id,
      (storeScores.get(row.store_id) ?? 0) + 8 * recencyWeight
    );
  }

  return {
    categoryScores,
    storeScores,
  };
}

function attachDistance(
  products: ProductListItemResponse[],
  userLat?: number,
  userLng?: number
): ProductListItemResponse[] {
  if (userLat === undefined || userLng === undefined) {
    return products;
  }

  return products.map((product) => {
    if (product.storeLat === undefined || product.storeLng === undefined) {
      return product;
    }

    return {
      ...product,
      distanceKm: calculateDistanceKm(
        userLat,
        userLng,
        product.storeLat,
        product.storeLng
      ),
    };
  });
}

function sortByPopularity(
  products: ProductListItemResponse[],
  popularityScores: Map<string, number>
): ProductListItemResponse[] {
  return [...products].sort((left, right) =>
    compareTieBreakers(left, right, popularityScores)
  );
}

function compareTieBreakers(
  left: ProductListItemResponse,
  right: ProductListItemResponse,
  popularityScores: Map<string, number>
): number {
  const popularityDiff =
    (popularityScores.get(right.id) ?? 0) -
    (popularityScores.get(left.id) ?? 0);

  if (popularityDiff !== 0) {
    return popularityDiff;
  }

  if (
    left.distanceKm !== undefined &&
    right.distanceKm !== undefined &&
    left.distanceKm !== right.distanceKm
  ) {
    return left.distanceKm - right.distanceKm;
  }

  const endAtDiff =
    new Date(left.endAt).getTime() - new Date(right.endAt).getTime();

  if (endAtDiff !== 0) {
    return endAtDiff;
  }

  return right.discountRate - left.discountRate;
}

function calculateRecommendationScore(
  product: ProductListItemResponse,
  profile: UserPreferenceProfile,
  popularityScore: number
): number {
  const categoryScore = product.categoryId
    ? (profile.categoryScores.get(product.categoryId) ?? 0)
    : 0;
  const storeScore = profile.storeScores.get(product.storeId) ?? 0;

  return (
    categoryScore +
    storeScore +
    getDistanceScore(product.distanceKm) +
    product.discountRate * 0.3 +
    getUrgencyScore(product.endAt) +
    popularityScore * 0.5
  );
}

function getOrderRecencyWeight(createdAt: string): number {
  const diffDays = getAgeInDays(createdAt);

  if (diffDays <= 7) {
    return 1;
  }

  if (diffDays <= 30) {
    return 0.6;
  }

  return 0.3;
}

function getViewRecencyWeight(viewedAt: string): number {
  return getAgeInDays(viewedAt) <= 7 ? 1 : 0.5;
}

function getAgeInDays(value: string): number {
  return (Date.now() - new Date(value).getTime()) / (1000 * 60 * 60 * 24);
}

function getDistanceScore(distanceKm?: number): number {
  if (distanceKm === undefined) {
    return 0;
  }

  if (distanceKm <= 1) {
    return 20;
  }

  if (distanceKm <= 3) {
    return 12;
  }

  if (distanceKm <= 5) {
    return 6;
  }

  return 0;
}

function getUrgencyScore(endAt: string): number {
  const diffHours = (new Date(endAt).getTime() - Date.now()) / (1000 * 60 * 60);

  if (diffHours <= 0) {
    return -1000;
  }

  if (diffHours <= 3) {
    return 12;
  }

  if (diffHours <= 6) {
    return 8;
  }

  return 3;
}

function calculateDistanceKm(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(toLat - fromLat);
  const deltaLng = toRadians(toLng - fromLng);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(fromLat)) *
      Math.cos(toRadians(toLat)) *
      Math.sin(deltaLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Number((earthRadiusKm * c).toFixed(1));
}

function paginateProducts(
  items: ProductListItemResponse[],
  params: ProductListParams,
  totalCount: number
): ProductListResponse {
  const from = (params.page - 1) * params.pageSize;
  const pagedItems = items.slice(from, from + params.pageSize);

  return {
    items: pagedItems,
    page: params.page,
    pageSize: params.pageSize,
    totalCount,
    totalPages: Math.ceil(totalCount / params.pageSize),
  };
}

function daysAgoToIsoString(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function escapeILikePattern(pattern: string): string {
  return pattern.replace(/[%_]/g, '\\$&');
}
