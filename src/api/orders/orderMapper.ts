import type { Order, OrderItem, OrderStatus } from '@/types/order';
import type { Payment } from '@/types/payment';
import type {
  OrderDetailResponse,
  OrderItemResponse,
  OrderListItemResponse,
} from '@/contracts/order';
import type { PaymentResponse } from '@/contracts/payment';

const ORDER_STATUS_MAP: Record<OrderListItemResponse['status'], OrderStatus> = {
  payment_pending: 'paymentPending',
  processing: 'processing',
  reserved: 'reserved',
  ready: 'ready',
  completed: 'completed',
  cancelled: 'cancelled',
  no_show: 'noShow',
  expired: 'expired',
};

function mapPayment(dto: PaymentResponse): Payment {
  return {
    id: dto.id,
    orderId: dto.orderId,
    orderNumber: dto.orderNumber,
    provider: dto.provider,
    providerPaymentKey: dto.providerPaymentKey,
    providerOrderId: dto.providerOrderId,
    method: dto.method,
    methodDetail: dto.methodDetail,
    amount: dto.amount,
    status: dto.status,
    paidAt: dto.paidAt ? new Date(dto.paidAt) : undefined,
    refundedAt: dto.refundedAt ? new Date(dto.refundedAt) : undefined,
    refundReason: dto.refundReason,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  };
}

function mapOrderItem(dto: OrderItemResponse): OrderItem {
  return {
    id: dto.id,
    orderId: dto.orderId,
    productId: dto.productId,
    productName: dto.productName,
    originalPrice: dto.originalPrice,
    discountPrice: dto.discountPrice,
    quantity: dto.quantity,
    subtotal: dto.subtotal,
    createdAt: new Date(dto.createdAt),
  };
}

export function mapOrder(dto: OrderDetailResponse): Order {
  return {
    id: dto.id,
    orderNumber: dto.orderNumber,
    storeId: dto.storeId,
    storeName: dto.storeName,
    totalAmount: dto.totalAmount,
    discountAmount: dto.discountAmount,
    paymentAmount: dto.paymentAmount,
    status: ORDER_STATUS_MAP[dto.status],
    pickupAt: new Date(dto.pickupAt),
    pickupServiceDate: new Date(dto.pickupServiceDate),
    storeOrderNumber: dto.storeOrderNumber,
    pickupNumber: dto.pickupNumber,
    expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    pickedUpAt: dto.pickedUpAt ? new Date(dto.pickedUpAt) : undefined,
    cancelledAt: dto.cancelledAt ? new Date(dto.cancelledAt) : undefined,
    cancelReason: dto.cancelReason,
    items: dto.items.map(mapOrderItem),
    payment: dto.payment ? mapPayment(dto.payment) : undefined,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  };
}

export function mapOrderListItem(
  dto: OrderListItemResponse
): Omit<Order, 'items' | 'payment'> {
  return {
    id: dto.id,
    orderNumber: dto.orderNumber,
    storeId: dto.storeId,
    storeName: dto.storeName,
    totalAmount: dto.totalAmount,
    discountAmount: dto.discountAmount,
    paymentAmount: dto.paymentAmount,
    status: ORDER_STATUS_MAP[dto.status],
    pickupAt: new Date(dto.pickupAt),
    pickupServiceDate: new Date(dto.pickupServiceDate),
    storeOrderNumber: dto.storeOrderNumber,
    pickupNumber: dto.pickupNumber,
    expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  };
}
