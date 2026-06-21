import { type Page } from '@playwright/test';

interface PaymentOptions {
  timeout?: number;
}

export async function waitForPaymentPopupAndComplete(
  page: Page,
  triggerPayment: () => Promise<void>,
  options: PaymentOptions = {}
): Promise<string> {
  const { timeout = 30_000 } = options;

  const popupPromise = page.waitForEvent('popup', { timeout });

  await triggerPayment();

  const popup = await popupPromise;

  await popup.waitForEvent('close', { timeout }).catch(() => {});

  await page.waitForURL('**/order/complete**', { timeout });

  return page.url();
}
