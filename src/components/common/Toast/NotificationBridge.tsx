'use client';

import { useOrderStatusNotification } from '@/hooks/notifications/useOrderStatusNotification';
import { useSellerNewOrderNotification } from '@/hooks/notifications/useSellerNewOrderNotification';
import { useMyStore } from '@/hooks/stores/useMyStore';
import { useMe } from '@/hooks/users/useMe';

import { ToastContainer } from './ToastContainer';

function SellerNotificationBridge() {
  const { data: store } = useMyStore();
  useSellerNewOrderNotification(store?.id ?? null);
  return null;
}

export function NotificationBridge() {
  const { data: user } = useMe();

  const consumerUserId = user?.role === 'customer' ? user.id : null;
  useOrderStatusNotification(consumerUserId);

  return (
    <>
      <ToastContainer />
      {user?.role === 'seller' && <SellerNotificationBridge />}
    </>
  );
}
