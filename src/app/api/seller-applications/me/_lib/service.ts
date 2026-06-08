import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';

import { toSellerApplicationResponse } from '../../_lib/mapper';

export async function getMySellerApplication(userId: string) {
  const supabase = createServiceRoleClient();

  const { data: appData, error: appError } = await supabase
    .from('seller_applications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (appError) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  if (!appData) {
    throw new AppError(ERROR_CODE.SELLER_APPLICATION_NOT_FOUND, 404);
  }

  const { data: docsData, error: docsError } = await supabase
    .from('seller_application_documents')
    .select('*')
    .eq('application_id', appData.id);

  if (docsError) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  return toSellerApplicationResponse(appData, docsData ?? []);
}

export async function getDocumentSignedUrl(
  userId: string,
  documentId: string
): Promise<string> {
  const supabase = createServiceRoleClient();

  // 문서 조회
  const { data: doc, error: docError } = await supabase
    .from('seller_application_documents')
    .select('storage_path, application_id')
    .eq('id', documentId)
    .maybeSingle();

  if (docError) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  if (!doc) {
    throw new AppError(ERROR_CODE.APPLICATION_DOCUMENT_NOT_FOUND, 404);
  }

  // 소유권 검증
  const { data: app, error: appError } = await supabase
    .from('seller_applications')
    .select('user_id')
    .eq('id', doc.application_id)
    .maybeSingle();

  if (appError) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  if (app?.user_id !== userId) {
    throw new AppError(ERROR_CODE.FORBIDDEN, 403);
  }

  // signed URL 생성 (5분)
  const { data: signedData, error: signedError } = await supabase.storage
    .from('seller-application-documents')
    .createSignedUrl(doc.storage_path, 60 * 5);

  if (signedError || !signedData?.signedUrl) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  return signedData.signedUrl;
}
