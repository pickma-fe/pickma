'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { User } from '@/types/user';
import type { UpdateMeRequest } from '@/contracts/user';
import { queryKeys } from '@/lib/queryKeys';
import { fileApi } from '@/api/files/fileApi';
import { userApi } from '@/api/users/userApi';

type UpdateMeVariables = UpdateMeRequest & { imageFile?: File };

export function useUpdateMe() {
  const queryClient = useQueryClient();

  return useMutation<User, Error, UpdateMeVariables>({
    mutationFn: async ({ imageFile, ...data }) => {
      if (imageFile) {
        const profileImage = await fileApi.uploadFile(
          'profile_image',
          imageFile
        );
        return userApi.updateMe({ ...data, profileImage });
      }
      return userApi.updateMe(data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
    },
  });
}
