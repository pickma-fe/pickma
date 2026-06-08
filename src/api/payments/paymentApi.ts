import type {
  CancelPaymentRequest,
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

  cancelPayment(paymentId: string, body: CancelPaymentRequest): Promise<void> {
    return apiClient
      .post<void>(`/api/payments/${paymentId}/cancel`, body)
      .then(() => undefined);
  },
};
