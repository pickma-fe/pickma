export type SortOrder = 'asc' | 'desc';

export interface ValidationIssue {
  path: string;
  message: string;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
