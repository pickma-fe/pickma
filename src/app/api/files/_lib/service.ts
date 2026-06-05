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
  const { error } = await supabase.storage
    .from(CLEANUP_BUCKET)
    .remove(storagePaths);

  if (error) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }
}
