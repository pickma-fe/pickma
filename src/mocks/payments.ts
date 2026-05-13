import type {
  PaymentResponse,
  PreparePaymentResponse,
} from '@/contracts/payment';

export const mockPreparePaymentResult: PreparePaymentResponse = {
  provider: 'toss',
  flow: 'redirect',
  redirectUrl:
    '/payment/success?orderNumber=TEST-001&provider=toss&amount=5000',
  orderNumber: 'TEST-001',
  amount: 5000,
};

export const mockPaymentResponse: PaymentResponse = {
  id: 'payment-uuid-1',
  orderId: 'order-uuid-1',
  orderNumber: 'TEST-001',
  provider: 'toss',
  providerPaymentKey: 'mock_ppk_1234567890_TEST-001',
  providerOrderId: 'mock_poi_TEST-001',
  method: 'card',
  amount: 5000,
  status: 'paid',
  paidAt: '2026-05-13T12:00:00.000Z',
  createdAt: '2026-05-13T12:00:00.000Z',
  updatedAt: '2026-05-13T12:00:00.000Z',
};

export const mockPaymentConfirmResult = undefined;
