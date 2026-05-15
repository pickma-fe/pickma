import type { CreateSellerApplicationRequest } from '@/contracts/seller-application';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';

import { toSellerApplicationResponse } from './mapper';

const REQUIRED_DOCUMENT_TYPES = [
  'business_license',
  'id_card',
  'bankbook',
  'business_report',
] as const;

function validateDocumentStoragePath(
  storagePath: string,
  userId: string,
  documentType: string
): boolean {
  const segments = storagePath.split('/');
  if (segments.length < 4) return false;
  if (segments[0] !== userId) return false;
  if (segments[2] !== documentType) return false;
  return true;
}

export async function createSellerApplication(
  userId: string,
  body: CreateSellerApplicationRequest
) {
  const docTypes = body.documents.map((d) => d.type);
  const uniqueTypes = new Set(docTypes);
  if (
    uniqueTypes.size !== REQUIRED_DOCUMENT_TYPES.length ||
    REQUIRED_DOCUMENT_TYPES.some((t) => !uniqueTypes.has(t))
  ) {
    throw new AppError(ERROR_CODE.VALIDATION_ERROR, 400);
  }

  for (const doc of body.documents) {
    if (!validateDocumentStoragePath(doc.storagePath, userId, doc.type)) {
      throw new AppError(ERROR_CODE.VALIDATION_ERROR, 400);
    }
  }

  const supabase = createServiceRoleClient();

  const storageChecks = await Promise.all(
    body.documents.map((doc) => {
      const segments = doc.storagePath.split('/');
      const folder = segments.slice(0, -1).join('/');
      const fileName = segments[segments.length - 1];
      return supabase.storage
        .from('seller-application-documents')
        .list(folder, { search: fileName });
    })
  );

  for (const { data, error } of storageChecks) {
    if (error || !data || data.length === 0) {
      throw new AppError(ERROR_CODE.VALIDATION_ERROR, 400);
    }
  }

  const { data: application, error: appError } = await supabase
    .from('seller_applications')
    .insert({
      user_id: userId,
      status: 'pending',
      business_number: body.businessNumber,
      company_name: body.companyName,
      representative_name: body.representativeName,
      business_address: body.businessAddress,
      business_type: body.businessType,
      business_category: body.businessCategory,
    })
    .select()
    .single();

  if (appError || !application) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  const { data: documents, error: docError } = await supabase
    .from('seller_application_documents')
    .insert(
      body.documents.map((doc) => ({
        application_id: application.id,
        type: doc.type,
        storage_path: doc.storagePath,
        original_file_name: doc.originalFileName,
        content_type: doc.contentType,
        size: doc.size,
      }))
    )
    .select();

  if (docError || !documents) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  return toSellerApplicationResponse(application, documents);
}
