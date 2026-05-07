'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { User } from '@/types/user';
import type { UpdateMeRequest } from '@/contracts/user';
import { userApi } from '@/api/users/userApi';

export function useUpdateMe() {
  const queryClient = useQueryClient();

  return useMutation<User, Error, UpdateMeRequest>({
    mutationFn: (data) => userApi.updateMe(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
    },
  });
}
