'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type {
  CreateSellerApplicationInput,
  SellerApplication,
  SellerApplicationDocumentFiles,
  SellerApplicationDocumentUploadInput,
  SellerApplicationDocumentType,
} from '@/types/seller-application';
import { queryKeys } from '@/lib/queryKeys';
import { fileApi } from '@/api/files/fileApi';
import { sellerApplicationApi } from '@/api/seller-applications/sellerApplicationApi';

const DOC_TYPE_MAP: Record<
  keyof SellerApplicationDocumentFiles,
  SellerApplicationDocumentType
> = {
  businessLicense: 'business_license',
  foodServicePermit: 'food_service_permit',
  bankAccount: 'bank_account',
};

async function cleanupPaths(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  try {
    await fileApi.deleteFiles(paths);
  } catch {
    // TODO: logger 추가 후 cleanup 실패 원본 로깅
  }
}

export function useCreateSellerApplication() {
  const queryClient = useQueryClient();

  return useMutation<SellerApplication, Error, CreateSellerApplicationInput>({
    mutationFn: async ({ documents, ...rest }) => {
      const entries = Object.entries(documents) as [
        keyof SellerApplicationDocumentFiles,
        File,
      ][];

      const results = await Promise.allSettled(
        entries.map(async ([key, file]) => {
          const documentType = DOC_TYPE_MAP[key];
          const storagePath = await fileApi.uploadFile(
            'seller_application_document',
            file,
            { documentType }
          );
          return {
            type: documentType,
            storagePath,
            originalFileName: file.name,
            contentType: file.type,
            size: file.size,
          };
        })
      );

      const uploadedPaths: string[] = [];
      const uploadedDocs: SellerApplicationDocumentUploadInput[] = [];
      const firstError = results.find((r) => r.status === 'rejected');

      for (const result of results) {
        if (result.status === 'fulfilled') {
          uploadedPaths.push(result.value.storagePath);
          uploadedDocs.push(result.value);
        }
      }

      if (firstError) {
        await cleanupPaths(uploadedPaths);
        throw firstError.reason as Error;
      }

      try {
        return await sellerApplicationApi.createSellerApplication({
          ...rest,
          documents: uploadedDocs,
        });
      } catch (err) {
        await cleanupPaths(uploadedPaths);
        throw err;
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.sellers.onboardingStatus(),
      });
    },
  });
}
