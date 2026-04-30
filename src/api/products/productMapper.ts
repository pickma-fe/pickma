import type {
  Product,
  ProductDetail,
  ProductDisplayStatus,
} from '@/types/product';
import type {
  ProductDetailResponse,
  ProductListItemResponse,
} from '@/contracts/product';

function toDisplayStatus(
  dto: Pick<ProductListItemResponse, 'status' | 'isSoldOut' | 'isExpired'>
): ProductDisplayStatus {
  if (dto.status === 'closed') return 'closed';
  if (dto.isExpired) return 'expired';
  if (dto.isSoldOut) return 'soldOut';
  return 'available';
}

export function mapProduct(dto: ProductListItemResponse): Product {
  return {
    id: dto.id,
    storeId: dto.storeId,
    storeName: dto.storeName,
    categoryId: dto.categoryId,
    categoryName: dto.categoryName,
    menuItemId: dto.menuItemId,
    name: dto.name,
    image: dto.image,
    originalPrice: dto.originalPrice,
    discountPrice: dto.discountPrice,
    discountRate: dto.discountRate,
    stock: dto.stock,
    reservedStock: dto.reservedStock,
    availableStock: dto.availableStock,
    endAt: new Date(dto.endAt),
    pickupStartTime: new Date(dto.pickupStartTime),
    pickupEndTime: new Date(dto.pickupEndTime),
    status: dto.status,
    isSoldOut: dto.isSoldOut,
    isExpired: dto.isExpired,
    displayStatus: toDisplayStatus(dto),
  };
}

export function mapProductDetail(dto: ProductDetailResponse): ProductDetail {
  return {
    ...mapProduct(dto),
    description: dto.description,
    store: dto.store,
  };
}
