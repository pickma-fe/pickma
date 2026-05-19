import type {
  SellerApplication,
  SellerApplicationDocument,
} from '@/types/seller-application';
import type {
  SellerApplicationDocumentResponse,
  SellerApplicationResponse,
} from '@/contracts/seller-application';

export function mapSellerApplication(
  dto: SellerApplicationResponse
): SellerApplication {
  return {
    id: dto.id,
    userId: dto.userId,
    status: dto.status,
    businessNumber: dto.businessNumber,
    companyName: dto.companyName,
    representativeName: dto.representativeName,
    businessAddress: dto.businessAddress,
    businessType: dto.businessType,
    businessCategory: dto.businessCategory,
    ...(dto.rejectReason !== undefined && { rejectReason: dto.rejectReason }),
    ...(dto.reviewedAt !== undefined && {
      reviewedAt: new Date(dto.reviewedAt),
    }),
    documents: dto.documents.map(mapSellerApplicationDocument),
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  };
}

function mapSellerApplicationDocument(
  dto: SellerApplicationDocumentResponse
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
