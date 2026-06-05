import type { Product } from '@/types/product';
import type {
  CreateSellerProductRequest,
  ProductListItemResponse,
  UpdateSellerProductRequest,
} from '@/contracts/product';
import { apiClient } from '@/api/apiClient';

import { mapSellerProduct } from './sellerProductMapper';

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

  createProduct(body: CreateSellerProductRequest): Promise<Product> {
    return apiClient
      .post<ProductListItemResponse>('/api/seller/products', body)
      .then(mapSellerProduct);
  },

  updateProduct(
    id: string,
    body: UpdateSellerProductRequest
  ): Promise<Product> {
    return apiClient
      .patch<ProductListItemResponse>(`/api/seller/products/${id}`, body)
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
