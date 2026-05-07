'use client';

import { useState, useEffect, useRef } from 'react';

import type { StoreInfoData } from '@/types/store';

import type { StoreStepState } from '../_components/types';

const INITIAL_STORE_STATE: StoreStepState = {
  storeInfoSubmitted: false,
  reviewStatus: 'pending',
  storeStatus: 'waiting',
};

export function useStoreRegister() {
  const [storeState, setStoreState] =
    useState<StoreStepState>(INITIAL_STORE_STATE);
  const [storeInfo, setStoreInfo] = useState<StoreInfoData | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const clearTimers = () => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];
  };

  const handleStoreInfoComplete = (data?: StoreInfoData) => {
    if (data) {
      setStoreInfo(data);
    }
    setStoreState((prev) => ({
      ...prev,
      storeInfoSubmitted: true,
      reviewStatus: 'pending',
      storeStatus: 'waiting',
    }));

    clearTimers();

    const timer1 = setTimeout(() => {
      setStoreState((prev) => ({ ...prev, reviewStatus: 'reviewing' }));
    }, 3000);

    const timer2 = setTimeout(() => {
      setStoreState((prev) => ({ ...prev, reviewStatus: 'completed' }));
    }, 6000);

    const timer3 = setTimeout(() => {
      setStoreState((prev) => ({ ...prev, storeStatus: 'approved' }));
    }, 9000);

    timersRef.current = [timer1, timer2, timer3];
  };

  return {
    storeState,
    storeInfo,
    handleStoreInfoComplete,
  };
}
