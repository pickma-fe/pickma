import type { ProductListItemResponse } from '@/contracts/product';

export type SellerProductRow = {
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
    image: string | null;
  };
  categories: {
    id: string;
    name: string;
  } | null;
  stores: {
    id: string;
    name: string;
  };
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

export function mapSellerProductRow(
  row: SellerProductRow
): ProductListItemResponse {
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
  };
}
