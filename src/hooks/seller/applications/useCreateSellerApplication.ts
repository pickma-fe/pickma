'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type {
  SellerApplication,
  SellerApplicationDocumentType,
} from '@/types/seller-application';
import type { CreateSellerApplicationRequest } from '@/contracts/seller-application';
import { fileApi } from '@/api/files/fileApi';
import { sellerApplicationApi } from '@/api/seller-applications/sellerApplicationApi';

type DocumentFiles = {
  businessLicense: File;
  idCard: File;
  bankbook: File;
  businessReport: File;
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
    idCard: 'id_card',
    bankbook: 'bankbook',
    businessReport: 'business_report',
  };

export function useCreateSellerApplication() {
  const queryClient = useQueryClient();

  return useMutation<SellerApplication, Error, CreateSellerApplicationInput>({
    mutationFn: async ({ documents, ...rest }) => {
      const uploadedDocs = await Promise.all(
        (Object.entries(documents) as [keyof DocumentFiles, File][]).map(
          async ([key, file]) => {
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
          }
        )
      );

      return sellerApplicationApi.createSellerApplication({
        ...rest,
        documents: uploadedDocs,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['sellers', 'onboarding-status'],
      });
    },
  });
}
