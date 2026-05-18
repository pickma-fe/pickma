import type { MenuItem } from '@/types/menu-item';
import type { MenuItemResponse } from '@/contracts/menu-item';

export function mapMenuItem(dto: MenuItemResponse): MenuItem {
  return {
    id: dto.id,
    storeId: dto.storeId,
    categoryId: dto.categoryId,
    categoryName: dto.categoryName,
    name: dto.name,
    ...(dto.description !== undefined && { description: dto.description }),
    ...(dto.image !== undefined && { image: dto.image }),
    originalPrice: dto.originalPrice,
    status: dto.status,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  };
}
