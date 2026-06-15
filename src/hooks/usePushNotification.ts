'use client';

import { useState } from 'react';

type PushPermission = 'default' | 'granted' | 'denied';

function getInitialPermission(): PushPermission {
  if (typeof window === 'undefined') return 'default';
  if (!('Notification' in window)) return 'default';
  return Notification.permission;
}

export function usePushNotification() {
  const [permission, setPermission] =
    useState<PushPermission>(getInitialPermission);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );

  const requestPermission = async (): Promise<PushPermission> => {
    if (!('Notification' in window)) return 'denied';

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === 'granted') {
      await subscribeToPush();
    }

    return result;
  };

  const subscribeToPush = async (): Promise<PushSubscription | null> => {
    if (!('serviceWorker' in navigator)) return null;

    const registration = await navigator.serviceWorker.ready;

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) return null;

    const existingSubscription =
      await registration.pushManager.getSubscription();
    if (existingSubscription) {
      setSubscription(existingSubscription);
      return existingSubscription;
    }

    const newSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey,
    });

    setSubscription(newSubscription);
    return newSubscription;
  };

  const unsubscribeFromPush = async (): Promise<void> => {
    if (!subscription) return;
    await subscription.unsubscribe();
    setSubscription(null);
  };

  return {
    permission,
    subscription,
    requestPermission,
    unsubscribeFromPush,
  };
}
