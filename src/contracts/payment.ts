export interface ConfirmPaymentRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}
