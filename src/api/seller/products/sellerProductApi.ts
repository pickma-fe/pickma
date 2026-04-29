import type { Product } from '@/types/product';
import type { ProductListItemResponse } from '@/contracts/product';

import { mapSellerProduct } from './sellerProductMapper';
import { apiClient } from '../../apiClient';

export interface CreateSellerProductRequest {
  menuItemId: string;
  discountPrice: number;
  stock: number;
  endAt: string;
  pickupStartTime: string;
  pickupEndTime: string;
}

export interface UpdateSellerProductRequest {
  discountPrice?: number;
  stock?: number;
  endAt?: string;
  pickupStartTime?: string;
  pickupEndTime?: string;
}

export const sellerProductApi = {
  getProducts(): Promise<Product[]> {
    return apiClient
      .get<ProductListItemResponse[]>('/api/seller/products')
      .then((items) => items.map(mapSellerProduct));
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
    return apiClient.delete<void>(`/api/seller/products/${id}`);
  },
};
