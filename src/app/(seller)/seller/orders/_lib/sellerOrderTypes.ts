import type { OrderStatus } from '@/types/order';

export type SellerOrderActionStatus = Extract<
  OrderStatus,
  'accepted' | 'ready' | 'completed' | 'cancelled'
>;

export type SellerOrderDisplayStatus = Extract<
  OrderStatus,
  'reserved' | 'accepted' | 'ready' | 'completed' | 'cancelled' | 'noShow'
>;
