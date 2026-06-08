'use client';

import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import type { PaginatedResult } from '@/types/common';
import type { Product } from '@/types/product';
import { queryKeys } from '@/lib/queryKeys';
import { adminProductApi } from '@/api/admin/products/adminProductApi';

export type AdminProductsQuery = NonNullable<
  Parameters<typeof adminProductApi.getProducts>[0]
>;

export function useAdminProducts(
  params: AdminProductsQuery = {}
): UseQueryResult<PaginatedResult<Product>> {
  return useQuery<PaginatedResult<Product>>({
    queryKey: queryKeys.admin.products.list(params),
    queryFn: () => adminProductApi.getProducts(params),
  });
}
