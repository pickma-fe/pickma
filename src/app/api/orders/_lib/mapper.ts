import type { CreateOrderResponse } from '@/contracts/order';

interface OrderItemSnapshot {
  product_name: string;
  quantity: number;
}

export function buildOrderName(items: OrderItemSnapshot[]): string {
  if (items.length === 0) return '주문';
  const first = items[0];
  const label = `${first.product_name} ${first.quantity}개`;
  return items.length > 1 ? `${label} 외 ${items.length - 1}건` : label;
}

export function mapCreateOrderResponse(params: {
  orderId: string;
  orderNumber: string;
  orderName: string;
  paymentAmount: number;
  expiresAt: string;
}): CreateOrderResponse {
  return {
    id: params.orderId,
    orderNumber: params.orderNumber,
    orderName: params.orderName,
    paymentAmount: params.paymentAmount,
    expiresAt: params.expiresAt,
  };
}

export type {
  OrderListRow,
  OrderItemRow,
  OrderDetailRow,
} from '@/app/api/_lib/order-mapper';
export {
  mapOrderListRow,
  mapOrderItemRow,
  mapOrderDetailRow,
} from '@/app/api/_lib/order-mapper';
