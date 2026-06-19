import type { OrderStatus } from '@/types/order';

export type SellerOrderActionStatus = Extract<
  OrderStatus,
  'accepted' | 'ready' | 'completed'
>;

export type SellerOrderDisplayStatus = Extract<
  OrderStatus,
  | 'reserved'
  | 'accepted'
  | 'ready'
  | 'completed'
  | 'cancelling'
  | 'cancelled'
  | 'noShow'
>;

export interface SellerOrderSummary {
  totalCount: number;
  statusCounts: {
    reserved: number;
    accepted: number;
    ready: number;
    completed: number;
    cancelling: number;
    cancelled: number;
    noShow: number;
    expired: number;
  };
}
