import type { Category } from '@/types/category';
import type { CategoryResponse } from '@/contracts/category';

export function mapCategory(dto: CategoryResponse): Category {
  return {
    id: dto.id,
    name: dto.name,
    ...(dto.icon !== undefined && { icon: dto.icon }),
    sortOrder: dto.sortOrder,
  };
}
