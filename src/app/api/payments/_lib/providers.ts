import type { PaymentMethod, PaymentProvider } from '@/types/payment';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { isApiMockEnabled } from '@/app/api/_lib/mock';

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
  if (isApiMockEnabled()) return mockProvider;
  switch (provider) {
    default:
      throw new AppError(ERROR_CODE.NOT_IMPLEMENTED, 501);
  }
}
