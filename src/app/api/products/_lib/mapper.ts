import type {
  ProductDetailResponse,
  ProductListItemResponse,
} from '@/contracts/product';
import type { Database } from '@/lib/supabase/database';

export type ProductRow = {
  id: string;
  store_id: string;
  menu_item_id: string;
  category_id: string | null;
  discount_price: number;
  original_price: number;
  discount_rate: number;
  available_stock: number;
  stock: number;
  reserved_stock: number;
  end_at: string;
  pickup_start_time: string;
  pickup_end_time: string;
  status: 'active' | 'closed';
  updated_at: string;
  menu_items: {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
  };
  categories: {
    id: string;
    name: string;
  } | null;
  stores: {
    id: string;
    name: string;
    description: string | null;
    phone: string;
    address: string;
    address_detail: string | null;
    region: string;
    image: string | null;
    latitude: number | null;
    longitude: number | null;
  };
  dist_km?: number | null;
};

export type RpcProductRow = {
  id: string;
  store_id: string;
  menu_item_id: string;
  category_id: string | null;
  discount_price: number;
  original_price: number;
  discount_rate: number;
  available_stock: number;
  stock: number;
  reserved_stock: number;
  end_at: string;
  pickup_start_time: string;
  pickup_end_time: string;
  status: Database['public']['Enums']['product_status'];
  updated_at: string;
  menu_item_name: string;
  menu_item_description: string | null;
  menu_item_image: string | null;
  cat_id: string | null;
  cat_name: string | null;
  store_name: string;
  store_description: string | null;
  store_phone: string;
  store_address: string;
  store_address_detail: string | null;
  store_region: string;
  store_image: string | null;
  store_lat: number;
  store_lng: number;
  distance_km: number;
  total_count: number;
};

function toDisplayStatus(
  status: 'active' | 'closed',
  isSoldOut: boolean,
  isExpired: boolean
): ProductListItemResponse['displayStatus'] {
  if (status === 'closed') return 'closed';
  if (isExpired) return 'expired';
  if (isSoldOut) return 'soldOut';
  return 'available';
}

export function mapProductRow(row: ProductRow): ProductListItemResponse {
  const availableStock = row.available_stock;
  const discountRate = row.discount_rate;
  const isSoldOut = availableStock <= 0;
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
    discountRate,
    stock: row.stock,
    reservedStock: row.reserved_stock,
    availableStock,
    isSoldOut,
    isExpired,
    displayStatus: toDisplayStatus(row.status, isSoldOut, isExpired),
    endAt: row.end_at,
    pickupStartTime: row.pickup_start_time,
    pickupEndTime: row.pickup_end_time,
    status: row.status,
    updatedAt: row.updated_at,
    distanceKm: row.dist_km ?? undefined,
    storeLat: row.stores.latitude ?? undefined,
    storeLng: row.stores.longitude ?? undefined,
  };
}

export function mapRpcProductRow(row: RpcProductRow): ProductListItemResponse {
  const availableStock = row.available_stock;
  const isSoldOut = availableStock <= 0;
  const isExpired = new Date(row.end_at) <= new Date();
  const { status } = row;
  if (status !== 'active' && status !== 'closed') {
    throw new Error(
      `RPC에서 유효하지 않은 product status가 반환됐습니다: ${status}`
    );
  }

  return {
    id: row.id,
    storeId: row.store_id,
    storeName: row.store_name,
    categoryId: row.cat_id ?? undefined,
    categoryName: row.cat_name ?? undefined,
    menuItemId: row.menu_item_id,
    name: row.menu_item_name,
    image: row.menu_item_image ?? undefined,
    originalPrice: row.original_price,
    discountPrice: row.discount_price,
    discountRate: row.discount_rate,
    stock: row.stock,
    reservedStock: row.reserved_stock,
    availableStock,
    isSoldOut,
    isExpired,
    displayStatus: toDisplayStatus(status, isSoldOut, isExpired),
    endAt: row.end_at,
    pickupStartTime: row.pickup_start_time,
    pickupEndTime: row.pickup_end_time,
    status,
    updatedAt: row.updated_at,
    distanceKm: row.distance_km,
    storeLat: row.store_lat,
    storeLng: row.store_lng,
  };
}

export function mapProductDetailRow(row: ProductRow): ProductDetailResponse {
  return {
    ...mapProductRow(row),
    description: row.menu_items.description ?? undefined,
    store: {
      id: row.stores.id,
      name: row.stores.name,
      description: row.stores.description ?? undefined,
      phone: row.stores.phone,
      address: row.stores.address,
      addressDetail: row.stores.address_detail ?? undefined,
      region: row.stores.region,
      image: row.stores.image ?? undefined,
    },
  };
}
