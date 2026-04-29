import type { ConfirmPaymentRequest } from '@/contracts/payment';

import { apiClient } from '../apiClient';

export const paymentApi = {
  confirmPayment(body: ConfirmPaymentRequest): Promise<void> {
    return apiClient.post<void>('/api/payments/confirm', body);
  },
};
