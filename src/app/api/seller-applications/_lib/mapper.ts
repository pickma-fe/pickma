import type {
  SellerApplicationDocumentResponse,
  SellerApplicationResponse,
} from '@/contracts/seller-application';
import type { Database } from '@/lib/supabase/database';

type ApplicationRow =
  Database['public']['Tables']['seller_applications']['Row'];
type DocumentRow =
  Database['public']['Tables']['seller_application_documents']['Row'];

export function toSellerApplicationResponse(
  row: ApplicationRow,
  documents: DocumentRow[]
): SellerApplicationResponse {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    businessNumber: row.business_number,
    companyName: row.company_name,
    representativeName: row.representative_name,
    businessAddress: row.business_address,
    businessType: row.business_type,
    businessCategory: row.business_category,
    documentConsentAgreed: row.document_consent_agreed,
    ...(row.document_consent_agreed_at !== null && {
      documentConsentAgreedAt: row.document_consent_agreed_at,
    }),
    ...(row.reject_reason !== null && { rejectReason: row.reject_reason }),
    ...(row.reviewed_at !== null && { reviewedAt: row.reviewed_at }),
    documents: documents.map(toSellerApplicationDocumentResponse),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toSellerApplicationDocumentResponse(
  row: DocumentRow
): SellerApplicationDocumentResponse {
  return {
    id: row.id,
    applicationId: row.application_id,
    type: row.type,
    storagePath: row.storage_path,
    originalFileName: row.original_file_name,
    contentType: row.content_type,
    size: row.size,
    createdAt: row.created_at,
  };
}
