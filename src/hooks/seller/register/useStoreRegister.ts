'use client';

import { useState, useEffect, useRef } from 'react';

type StoreReviewStatus = 'pending' | 'reviewing' | 'completed';
type StoreStatus = 'waiting' | 'approved' | 'rejected';

export interface StoreStepState {
  storeInfoSubmitted: boolean;
  reviewStatus: StoreReviewStatus;
  storeStatus: StoreStatus;
}

const INITIAL_STORE_STATE: StoreStepState = {
  storeInfoSubmitted: false,
  reviewStatus: 'pending',
  storeStatus: 'waiting',
};

export function useStoreRegister() {
  const [storeState, setStoreState] =
    useState<StoreStepState>(INITIAL_STORE_STATE);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const clearTimers = () => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];
  };

  const handleStoreInfoComplete = () => {
    setStoreState((prev) => ({
      ...prev,
      storeInfoSubmitted: true,
      reviewStatus: 'pending',
    }));

    // TODO: API 연동 시 아래 테스트 코드 삭제
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
    handleStoreInfoComplete,
  };
}
