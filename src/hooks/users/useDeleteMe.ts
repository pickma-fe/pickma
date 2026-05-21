'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { userApi } from '@/api/users/userApi';

export function useDeleteMe() {
  const queryClient = useQueryClient();

  return useMutation<void, Error>({
    mutationFn: () => userApi.deleteMe(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
