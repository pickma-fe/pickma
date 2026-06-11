import type {
  CancelPaymentInput,
  ConfirmPaymentInput,
  PreparePaymentInput,
} from '@/types/payment';
import type {
  CancelPaymentRequest,
  ConfirmPaymentRequest,
  PreparePaymentRequest,
  PreparePaymentResponse,
} from '@/contracts/payment';

import { apiClient } from '../apiClient';

function toPreparePaymentRequest(
  input: PreparePaymentInput
): PreparePaymentRequest {
  return { ...input };
}

function toConfirmPaymentRequest(
  input: ConfirmPaymentInput
): ConfirmPaymentRequest {
  return { ...input };
}

function toCancelPaymentRequest(
  input: CancelPaymentInput
): CancelPaymentRequest {
  return { ...input };
}

export const paymentApi = {
  preparePayment(input: PreparePaymentInput): Promise<PreparePaymentResponse> {
    return apiClient.post<PreparePaymentResponse>(
      '/api/payments/prepare',
      toPreparePaymentRequest(input)
    );
  },
  confirmPayment(input: ConfirmPaymentInput): Promise<void> {
    return apiClient.post<void>(
      '/api/payments/confirm',
      toConfirmPaymentRequest(input)
    );
  },

  cancelPayment(paymentId: string, input: CancelPaymentInput): Promise<void> {
    return apiClient
      .post<void>(
        `/api/payments/${paymentId}/cancel`,
        toCancelPaymentRequest(input)
      )
      .then(() => undefined);
  },
};
