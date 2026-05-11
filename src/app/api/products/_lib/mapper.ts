import type {
  ProductDetailResponse,
  ProductListItemResponse,
} from '@/contracts/product';

export type ProductRow = {
  id: string;
  store_id: string;
  menu_item_id: string;
  category_id: string | null;
  discount_price: number;
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
    original_price: number;
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

export function mapProductRow(row: ProductRow): ProductListItemResponse {
  const availableStock = row.stock - row.reserved_stock;
  const discountRate = Math.round(
    (1 - row.discount_price / row.menu_items.original_price) * 100
  );
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
    originalPrice: row.menu_items.original_price,
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
