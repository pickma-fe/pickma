import type { PaginatedResult } from '@/types/common';
import type {
  AdminPendingSellerApplication,
  SellerApplicationDocument,
} from '@/types/seller-application';
import type {
  AdminPendingSellerApplicationListResponse,
  AdminPendingSellerApplicationResponse,
} from '@/contracts/admin';

function mapSellerApplicationDocument(
  dto: AdminPendingSellerApplicationResponse['documents'][number]
): SellerApplicationDocument {
  return {
    id: dto.id,
    applicationId: dto.applicationId,
    type: dto.type,
    storagePath: dto.storagePath,
    originalFileName: dto.originalFileName,
    contentType: dto.contentType,
    size: dto.size,
    createdAt: new Date(dto.createdAt),
  };
}

export function mapAdminPendingSellerApplication(
  dto: AdminPendingSellerApplicationResponse
): AdminPendingSellerApplication {
  return {
    id: dto.id,
    userId: dto.userId,
    applicantEmail: dto.applicantEmail,
    applicantName: dto.applicantName,
    applicantPhone: dto.applicantPhone,
    status: dto.status,
    businessNumber: dto.businessNumber,
    companyName: dto.companyName,
    representativeName: dto.representativeName,
    businessAddress: dto.businessAddress,
    businessType: dto.businessType,
    businessCategory: dto.businessCategory,
    documents: dto.documents.map(mapSellerApplicationDocument),
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  };
}

export function mapAdminPendingSellerApplicationList(
  dto: AdminPendingSellerApplicationListResponse
): PaginatedResult<AdminPendingSellerApplication> {
  return {
    items: dto.items.map(mapAdminPendingSellerApplication),
    page: dto.page,
    pageSize: dto.pageSize,
    totalCount: dto.totalCount,
    totalPages: dto.totalPages,
  };
}
