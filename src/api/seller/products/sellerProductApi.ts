import type {
  CreateSellerProductInput,
  Product,
  UpdateSellerProductInput,
} from '@/types/product';
import type {
  CreateSellerProductRequest,
  ProductListItemResponse,
  UpdateSellerProductRequest,
} from '@/contracts/product';
import { apiClient } from '@/api/apiClient';

import { mapSellerProduct } from './sellerProductMapper';

function toCreateSellerProductRequest(
  input: CreateSellerProductInput
): CreateSellerProductRequest {
  return {
    ...input,
    endAt: input.endAt.toISOString(),
  };
}

function toUpdateSellerProductRequest(
  input: UpdateSellerProductInput
): UpdateSellerProductRequest {
  return {
    ...input,
    endAt: input.endAt?.toISOString(),
  };
}

export const sellerProductApi = {
  getProducts(): Promise<Product[]> {
    return apiClient
      .get<ProductListItemResponse[]>('/api/seller/products')
      .then((items) => items.map(mapSellerProduct));
  },

  getProduct(id: string): Promise<Product> {
    return apiClient
      .get<ProductListItemResponse>(`/api/seller/products/${id}`)
      .then(mapSellerProduct);
  },

  createProduct(input: CreateSellerProductInput): Promise<Product> {
    return apiClient
      .post<ProductListItemResponse>(
        '/api/seller/products',
        toCreateSellerProductRequest(input)
      )
      .then(mapSellerProduct);
  },

  updateProduct(id: string, input: UpdateSellerProductInput): Promise<Product> {
    return apiClient
      .patch<ProductListItemResponse>(
        `/api/seller/products/${id}`,
        toUpdateSellerProductRequest(input)
      )
      .then(mapSellerProduct);
  },

  deleteProduct(id: string): Promise<void> {
    return apiClient
      .delete<null>(`/api/seller/products/${id}`)
      .then(() => undefined);
  },

  updateStock(id: string, stock: number): Promise<void> {
    return apiClient
      .patch<void>(`/api/seller/products/${id}/stock`, { stock })
      .then(() => undefined);
  },
};
