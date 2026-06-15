import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';

const PRODUCT_VIEW_DEDUPE_WINDOW_MS = 30 * 60 * 1000;

type ProductViewLookupRow = {
  store_id: string;
  category_id: string | null;
  status: 'active' | 'closed';
  stores: {
    status: 'active' | 'inactive';
    operation_status: 'open' | 'closed' | 'paused';
  };
};

export async function recordProductView(
  userId: string,
  productId: string
): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const { data: latestView, error: latestViewError } = await supabase
    .from('product_view_events')
    .select('viewed_at')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .order('viewed_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestViewError) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  if (
    latestView &&
    Date.now() - new Date(latestView.viewed_at).getTime() <
      PRODUCT_VIEW_DEDUPE_WINDOW_MS
  ) {
    return false;
  }

  const { data: product, error: productError } = await supabase
    .from('products')
    .select(
      'store_id, category_id, status, stores!inner(status, operation_status)'
    )
    .eq('id', productId)
    .eq('status', 'active')
    .eq('stores.status', 'active')
    .eq('stores.operation_status', 'open')
    .single<ProductViewLookupRow>();

  if (productError) {
    if ('code' in productError && productError.code === 'PGRST116') {
      throw new AppError(ERROR_CODE.PRODUCT_NOT_FOUND, 404);
    }
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  const { error: insertError } = await supabase
    .from('product_view_events')
    .insert({
      user_id: userId,
      product_id: productId,
      store_id: product.store_id,
      category_id: product.category_id,
    });

  if (insertError) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  return true;
}
