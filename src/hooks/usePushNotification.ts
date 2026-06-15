'use client';

import { useEffect, useState } from 'react';

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

  // 마운트 시 기존 구독 복원
  useEffect(() => {
    if (permission !== 'granted') return;
    if (!('serviceWorker' in navigator)) return;

    void navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((existingSubscription) => {
        if (existingSubscription) setSubscription(existingSubscription);
      })
      .catch(() => {
        // 초기 동기화 실패는 무시 (사용자 액션 시 재시도 가능)
      });
  }, [permission]);

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
