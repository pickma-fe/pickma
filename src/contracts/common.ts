export interface ApiSuccess<T> {
  statusCode: number;
  data: T;
  message?: string;
}

export interface ValidationIssue {
  path: string;
  message: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  error: {
    code: string;
    message: string;
    details?: ValidationIssue[];
  };
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
