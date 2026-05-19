export interface CategoryResponse {
  id: string;
  name: string;
  icon?: string;
  sortOrder: number;
}

export type CategoryListResponse = CategoryResponse[];
