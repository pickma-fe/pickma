import type {
  ConfirmPaymentRequest,
  PreparePaymentRequest,
  PreparePaymentResponse,
} from '@/contracts/payment';

import { apiClient } from '../apiClient';

export const paymentApi = {
  preparePayment(body: PreparePaymentRequest): Promise<PreparePaymentResponse> {
    return apiClient.post<PreparePaymentResponse>(
      '/api/payments/prepare',
      body
    );
  },
  confirmPayment(body: ConfirmPaymentRequest): Promise<void> {
    return apiClient.post<void>('/api/payments/confirm', body);
  },
};
