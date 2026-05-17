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
  if (segments.length !== 4) return false;
  const [pathUserId, uploadId, pathDocumentType, fileName] = segments;
  if (!pathUserId || !uploadId || !pathDocumentType || !fileName) return false;
  if (pathUserId !== userId) return false;
  if (pathDocumentType !== documentType) return false;
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
    if (error) {
      throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
    }
    if (!data || data.length === 0) {
      throw new AppError(ERROR_CODE.VALIDATION_ERROR, 400);
    }
  }

  const { data: applicationId, error: rpcError } = await supabase.rpc(
    'create_seller_application',
    {
      p_user_id: userId,
      p_business_number: body.businessNumber,
      p_company_name: body.companyName,
      p_representative_name: body.representativeName,
      p_business_address: body.businessAddress,
      p_business_type: body.businessType,
      p_business_category: body.businessCategory,
      p_documents: body.documents.map((doc) => ({
        type: doc.type,
        storage_path: doc.storagePath,
        original_file_name: doc.originalFileName,
        content_type: doc.contentType,
        size: doc.size,
      })),
    }
  );

  if (rpcError || !applicationId) {
    if (rpcError?.code === '23505') {
      throw new AppError(ERROR_CODE.APPLICATION_ALREADY_SUBMITTED, 409);
    }
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  const [appResult, docsResult] = await Promise.all([
    supabase
      .from('seller_applications')
      .select('*')
      .eq('id', applicationId)
      .single(),
    supabase
      .from('seller_application_documents')
      .select('*')
      .eq('application_id', applicationId),
  ]);

  if (
    appResult.error ||
    !appResult.data ||
    docsResult.error ||
    !docsResult.data
  ) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  return toSellerApplicationResponse(appResult.data, docsResult.data);
}
