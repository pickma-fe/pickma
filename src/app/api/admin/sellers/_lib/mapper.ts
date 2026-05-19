import type {
  AdminPendingSellerApplicationResponse,
  AdminPendingSellerApplicationListResponse,
} from '@/contracts/admin';
import type { SellerApplicationDocumentResponse } from '@/contracts/seller-application';
import type { Database } from '@/lib/supabase/database';

type ApplicationRow =
  Database['public']['Tables']['seller_applications']['Row'];
type DocumentRow =
  Database['public']['Tables']['seller_application_documents']['Row'];

interface UserInfo {
  email: string;
  name: string;
  phone?: string | null;
}

export function toAdminPendingSellerApplicationResponse(
  row: ApplicationRow,
  userInfo: UserInfo,
  documents: DocumentRow[]
): AdminPendingSellerApplicationResponse {
  return {
    id: row.id,
    userId: row.user_id,
    applicantEmail: userInfo.email,
    applicantName: userInfo.name,
    ...(userInfo.phone !== null &&
      userInfo.phone !== undefined && { applicantPhone: userInfo.phone }),
    status: 'pending',
    businessNumber: row.business_number,
    companyName: row.company_name,
    representativeName: row.representative_name,
    businessAddress: row.business_address,
    businessType: row.business_type,
    businessCategory: row.business_category,
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

export function toAdminPendingSellerApplicationListResponse(
  items: AdminPendingSellerApplicationResponse[],
  total: number,
  page: number,
  pageSize: number
): AdminPendingSellerApplicationListResponse {
  return {
    items,
    totalCount: total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
