import type { Order, OrderItem, OrderStatus } from '@/types/order';
import type {
  OrderDetailResponse,
  OrderItemResponse,
  OrderListItemResponse,
} from '@/contracts/order';

const ORDER_STATUS_MAP: Record<OrderListItemResponse['status'], OrderStatus> = {
  payment_pending: 'paymentPending',
  reserved: 'reserved',
  ready: 'ready',
  completed: 'completed',
  cancelled: 'cancelled',
  no_show: 'noShow',
  expired: 'expired',
};

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
    userId: '',
    storeId: dto.storeId,
    storeName: dto.storeName,
    totalAmount: dto.totalAmount,
    discountAmount: dto.discountAmount,
    paymentAmount: dto.paymentAmount,
    status: ORDER_STATUS_MAP[dto.status],
    pickupAt: new Date(dto.pickupAt),
    expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    pickedUpAt: dto.pickedUpAt ? new Date(dto.pickedUpAt) : undefined,
    cancelledAt: dto.cancelledAt ? new Date(dto.cancelledAt) : undefined,
    cancelReason: dto.cancelReason,
    items: dto.items.map(mapOrderItem),
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
    userId: '',
    storeId: dto.storeId,
    storeName: dto.storeName,
    totalAmount: dto.totalAmount,
    discountAmount: dto.discountAmount,
    paymentAmount: dto.paymentAmount,
    status: ORDER_STATUS_MAP[dto.status],
    pickupAt: new Date(dto.pickupAt),
    expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  };
}
