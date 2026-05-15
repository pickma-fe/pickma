import type { SellerApplicationDocumentReadUrlResponse } from '@/contracts/seller-application';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';

export async function getSellerApplicationDocumentReadUrl(
  id: string
): Promise<SellerApplicationDocumentReadUrlResponse> {
  const supabase = createServiceRoleClient();

  const { data: document, error: findError } = await supabase
    .from('seller_application_documents')
    .select('storage_path')
    .eq('id', id)
    .single();

  if (findError || !document) {
    throw new AppError(ERROR_CODE.APPLICATION_DOCUMENT_NOT_FOUND, 404);
  }

  const { data: urlData, error: urlError } = await supabase.storage
    .from('seller-application-documents')
    .createSignedUrl(document.storage_path, 60);

  if (urlError || !urlData) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  return { signedUrl: urlData.signedUrl };
}
