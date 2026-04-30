import type {
  OrderDetailResponse,
  OrderListItemResponse,
} from '@/contracts/order';
import type { ProductListItemResponse } from '@/contracts/product';

import { mockOrderDetail, mockOrders } from './orders';
import { mockProducts } from './products';

export const mockSellerProducts: ProductListItemResponse[] = mockProducts;

export const mockSellerCreatedProduct: ProductListItemResponse = {
  ...mockProducts[0],
  id: 'product_new_1',
  name: '새 마감 할인 상품',
};

export const mockSellerOrders: OrderListItemResponse[] = mockOrders;

export const mockSellerOrderDetail: OrderDetailResponse = mockOrderDetail;
