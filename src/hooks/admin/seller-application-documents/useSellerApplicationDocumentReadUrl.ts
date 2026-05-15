'use client';

import { useMutation } from '@tanstack/react-query';

import type { SellerApplicationDocumentReadUrlResponse } from '@/contracts/seller-application';
import { adminSellerApplicationDocumentApi } from '@/api/admin/seller-application-documents/adminSellerApplicationDocumentApi';

export function useSellerApplicationDocumentReadUrl() {
  return useMutation<SellerApplicationDocumentReadUrlResponse, Error, string>({
    mutationFn: (id) =>
      adminSellerApplicationDocumentApi.getSellerApplicationDocumentReadUrl(id),
  });
}
