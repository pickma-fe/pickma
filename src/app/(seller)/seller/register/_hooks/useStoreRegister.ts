'use client';

import { useState } from 'react';

import type { StoreInfoData } from '@/types/store';
import { useCreateStore } from '@/hooks/stores/useCreateStore';

import type { StoreStepState } from '../_components/types';

const INITIAL_STORE_STATE: StoreStepState = {
  storeInfoSubmitted: false,
  reviewStatus: 'pending',
  storeStatus: 'waiting',
};

export function useStoreRegister(businessNumber: string) {
  const [storeState, setStoreState] =
    useState<StoreStepState>(INITIAL_STORE_STATE);
  const [storeInfo, setStoreInfo] = useState<StoreInfoData | null>(null);
  const { mutate: createStore } = useCreateStore();

  const handleStoreInfoComplete = (data: StoreInfoData) => {
    setStoreInfo(data);
    const region =
      data.address.split(' ').slice(0, 2).join(' ') || data.address;
    createStore(
      {
        name: data.storeName,
        phone: data.phone,
        address: data.address,
        description: data.description || undefined,
        businessNumber,
        region,
      },
      {
        onSuccess: () => {
          setStoreState({
            storeInfoSubmitted: true,
            reviewStatus: 'completed',
            storeStatus: 'approved',
          });
        },
        onError: () => {
          setStoreInfo(null);
        },
      }
    );
  };

  return {
    storeState,
    storeInfo,
    handleStoreInfoComplete,
  };
}
