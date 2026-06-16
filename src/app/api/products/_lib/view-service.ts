import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';

export async function recordProductView(
  userId: string,
  productId: string
): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.rpc('record_product_view', {
    p_user_id: userId,
    p_product_id: productId,
  });

  if (error) {
    if ('message' in error && error.message === 'PRODUCT_NOT_FOUND') {
      throw new AppError(ERROR_CODE.PRODUCT_NOT_FOUND, 404);
    }

    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  return data ?? false;
}
