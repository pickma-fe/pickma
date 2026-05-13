import type { PaymentProviderAdapter } from './providers';

export const mockProvider: PaymentProviderAdapter = {
  async prepare({ orderNumber, provider, amount, successUrl }) {
    const params = new URLSearchParams({
      orderNumber,
      provider,
      amount: String(amount),
    });
    const delimiter = successUrl.includes('?') ? '&' : '?';
    return { redirectUrl: `${successUrl}${delimiter}${params.toString()}` };
  },

  async confirm({ orderNumber }) {
    return {
      providerPaymentKey: `mock_ppk_${Date.now()}_${orderNumber}`,
      providerOrderId: `mock_poi_${orderNumber}`,
      method: 'card',
      methodDetail: null,
    };
  },
};
