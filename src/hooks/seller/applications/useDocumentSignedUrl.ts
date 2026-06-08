'use client';

import { useQuery } from '@tanstack/react-query';

import type { SellerApplicationDocumentReadUrlResponse } from '@/contracts/seller-application';
import { queryKeys } from '@/lib/queryKeys';
import { sellerApplicationApi } from '@/api/seller-applications/sellerApplicationApi';

interface UseDocumentSignedUrlOptions {
  documentId: string;
  enabled?: boolean;
}

export function useDocumentSignedUrl({
  documentId,
  enabled = true,
}: UseDocumentSignedUrlOptions) {
  return useQuery<SellerApplicationDocumentReadUrlResponse>({
    queryKey: queryKeys.seller.application.documentSignedUrl(documentId),
    queryFn: () => sellerApplicationApi.getDocumentSignedUrl(documentId),
    enabled: Boolean(documentId) && enabled,
    staleTime: 4 * 60 * 1000,
    retry: false,
  });
}
