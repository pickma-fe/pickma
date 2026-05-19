import type { CategoryResponse } from '@/contracts/category';

export type CategoryRow = {
  id: string;
  name: string;
  icon: string | null;
  sort_order: number;
};

export function mapCategoryRow(row: CategoryRow): CategoryResponse {
  return {
    id: row.id,
    name: row.name,
    ...(row.icon !== null && { icon: row.icon }),
    sortOrder: row.sort_order,
  };
}
