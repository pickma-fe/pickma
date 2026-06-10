'use client';

import { useQuery } from '@tanstack/react-query';

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
  return useQuery<string>({
    queryKey: queryKeys.sellers.application.documentSignedUrl(documentId),
    queryFn: () => sellerApplicationApi.getDocumentSignedUrl(documentId),
    enabled: Boolean(documentId) && enabled,
    staleTime: 4 * 60 * 1000, // signed URL 만료(5분)보다 1분 짧게
    retry: false,
  });
}
