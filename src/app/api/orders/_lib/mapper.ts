import type {
  CreateOrderResponse,
  OrderDetailResponse,
  OrderItemResponse,
  OrderListItemResponse,
  OrderStatusParam,
} from '@/contracts/order';
import { type PaymentRow, mapPaymentRow } from '@/app/api/_lib/payment-mapper';

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

export interface OrderListRow {
  id: string;
  order_number: string;
  store_id: string;
  total_amount: number;
  discount_amount: number;
  payment_amount: number;
  status: OrderStatusParam;
  pickup_at: string;
  pickup_service_date: string;
  store_order_number: string | null;
  pickup_number: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  stores: { name: string };
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  original_price: number;
  discount_price: number;
  quantity: number;
  subtotal: number;
  created_at: string;
}

export interface OrderDetailRow extends OrderListRow {
  cancel_reason: string | null;
  cancelled_at: string | null;
  picked_up_at: string | null;
  order_items: OrderItemRow[];
  payments: PaymentRow | null;
}

export function mapOrderListRow(row: OrderListRow): OrderListItemResponse {
  return {
    id: row.id,
    orderNumber: row.order_number,
    storeId: row.store_id,
    storeName: row.stores.name,
    totalAmount: row.total_amount,
    discountAmount: row.discount_amount,
    paymentAmount: row.payment_amount,
    status: row.status,
    pickupAt: row.pickup_at,
    pickupServiceDate: row.pickup_service_date,
    storeOrderNumber: row.store_order_number ?? undefined,
    pickupNumber: row.pickup_number ?? undefined,
    expiresAt: row.expires_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapOrderItemRow(row: OrderItemRow): OrderItemResponse {
  return {
    id: row.id,
    orderId: row.order_id,
    productId: row.product_id,
    productName: row.product_name,
    originalPrice: row.original_price,
    discountPrice: row.discount_price,
    quantity: row.quantity,
    subtotal: row.subtotal,
    createdAt: row.created_at,
  };
}

export function mapOrderDetailRow(row: OrderDetailRow): OrderDetailResponse {
  return {
    ...mapOrderListRow(row),
    cancelledAt: row.cancelled_at ?? undefined,
    cancelReason: row.cancel_reason ?? undefined,
    pickedUpAt: row.picked_up_at ?? undefined,
    items: row.order_items.map(mapOrderItemRow),
    payment: row.payments
      ? mapPaymentRow(row.payments, row.order_number)
      : undefined,
  };
}
