import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';

const CLEANUP_BUCKET = 'seller-application-documents';

export async function deleteStorageFiles(
  userId: string,
  storagePaths: string[]
): Promise<void> {
  const unauthorized = storagePaths.some(
    (path) => !path.startsWith(`${userId}/`)
  );
  if (unauthorized) {
    throw new AppError(ERROR_CODE.FORBIDDEN, 403);
  }

  const supabase = createServiceRoleClient();

  const { data: refs, error: refError } = await supabase
    .from('seller_application_documents')
    .select('storage_path')
    .in('storage_path', storagePaths);

  if (refError) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  if (refs && refs.length > 0) {
    throw new AppError(ERROR_CODE.FORBIDDEN, 403);
  }

  const { error } = await supabase.storage
    .from(CLEANUP_BUCKET)
    .remove(storagePaths);

  if (error) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }
}
