'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type {
  SellerApplication,
  SellerApplicationDocumentType,
} from '@/types/seller-application';
import type { CreateSellerApplicationRequest } from '@/contracts/seller-application';
import { queryKeys } from '@/lib/queryKeys';
import { fileApi } from '@/api/files/fileApi';
import { sellerApplicationApi } from '@/api/seller-applications/sellerApplicationApi';

type DocumentFiles = {
  businessLicense: File;
  foodServicePermit: File;
  bankAccount: File;
};

export type CreateSellerApplicationInput = Omit<
  CreateSellerApplicationRequest,
  'documents'
> & {
  documents: DocumentFiles;
};

const DOC_TYPE_MAP: Record<keyof DocumentFiles, SellerApplicationDocumentType> =
  {
    businessLicense: 'business_license',
    foodServicePermit: 'food_service_permit',
    bankAccount: 'bank_account',
  };

async function cleanupPaths(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  try {
    await fileApi.deleteFiles(paths);
  } catch (err) {
    console.error('[useCreateSellerApplication] cleanup failed', err);
  }
}

export function useCreateSellerApplication() {
  const queryClient = useQueryClient();

  return useMutation<SellerApplication, Error, CreateSellerApplicationInput>({
    mutationFn: async ({ documents, ...rest }) => {
      const entries = Object.entries(documents) as [
        keyof DocumentFiles,
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
      const uploadedDocs: {
        type: SellerApplicationDocumentType;
        storagePath: string;
        originalFileName: string;
        contentType: string;
        size: number;
      }[] = [];
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
        queryKey: queryKeys.seller.onboardingStatus(),
      });
    },
  });
}
