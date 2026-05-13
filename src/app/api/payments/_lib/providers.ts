import type { PaymentMethod, PaymentProvider } from '@/types/payment';

import { mockProvider } from './mock-provider';

export interface PrepareParams {
  orderNumber: string;
  amount: number;
  expiresAt: string;
}

export interface PrepareResult {
  redirectUrl: string;
}

export interface ConfirmParams {
  orderNumber: string;
  amount: number;
}

export interface ConfirmResult {
  providerPaymentKey: string;
  providerOrderId: string;
  method: PaymentMethod;
  methodDetail: string | null;
}

export interface PaymentProviderAdapter {
  prepare(params: PrepareParams): Promise<PrepareResult>;
  confirm(params: ConfirmParams): Promise<ConfirmResult>;
}

export function getPaymentProviderAdapter(
  provider: PaymentProvider
): PaymentProviderAdapter {
  // Temporary P0 pass-through until real provider adapters are connected.
  void provider;
  return mockProvider;
}
