import type {
  CreateMenuItemRequest,
  MenuItemResponse,
  SellerMenuItemListParams,
  UpdateMenuItemRequest,
} from '@/contracts/menu-item';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';

import { mapMenuItemRow, type MenuItemRow } from './mapper';

const MENU_ITEM_SELECT = [
  'id',
  'store_id',
  'category_id',
  'name',
  'description',
  'image',
  'original_price',
  'status',
  'created_at',
  'updated_at',
  'categories!inner(id, name)',
].join(', ');

async function assertCategoryExists(categoryId: string): Promise<void> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('categories')
    .select('id')
    .eq('id', categoryId)
    .maybeSingle();

  if (error) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  if (!data) throw new AppError(ERROR_CODE.CATEGORY_NOT_FOUND, 404);
}

export async function getSellerMenuItems(
  storeId: string,
  params: SellerMenuItemListParams
): Promise<MenuItemResponse[]> {
  const supabase = createServiceRoleClient();
  let query = supabase
    .from('menu_items')
    .select(MENU_ITEM_SELECT)
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (params.categoryId) {
    query = query.eq('category_id', params.categoryId);
  }

  if (params.keyword) {
    query = query.ilike('name', `%${params.keyword}%`);
  }

  if (params.status) {
    query = query.eq('status', params.status);
  }

  const { data, error } = await query;

  if (error) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);

  return ((data ?? []) as unknown as MenuItemRow[]).map(mapMenuItemRow);
}

export async function createSellerMenuItem(
  storeId: string,
  body: CreateMenuItemRequest
): Promise<MenuItemResponse> {
  await assertCategoryExists(body.categoryId);

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('menu_items')
    .insert({
      store_id: storeId,
      category_id: body.categoryId,
      name: body.name,
      ...(body.description !== undefined && { description: body.description }),
      ...(body.image !== undefined && { image: body.image }),
      original_price: body.originalPrice,
    })
    .select(MENU_ITEM_SELECT)
    .single();

  if (error) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  if (!data) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);

  return mapMenuItemRow(data as unknown as MenuItemRow);
}

export async function updateSellerMenuItem(
  storeId: string,
  menuItemId: string,
  body: UpdateMenuItemRequest
): Promise<MenuItemResponse> {
  const supabase = createServiceRoleClient();

  const { data: existing, error: fetchError } = await supabase
    .from('menu_items')
    .select('id')
    .eq('id', menuItemId)
    .eq('store_id', storeId)
    .maybeSingle();

  if (fetchError) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  if (!existing) throw new AppError(ERROR_CODE.MENU_ITEM_NOT_FOUND, 404);

  if (body.categoryId) {
    await assertCategoryExists(body.categoryId);
  }

  const { data, error } = await supabase
    .from('menu_items')
    .update({
      ...(body.categoryId !== undefined && { category_id: body.categoryId }),
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.image !== undefined && { image: body.image }),
      ...(body.originalPrice !== undefined && {
        original_price: body.originalPrice,
      }),
      ...(body.status !== undefined && { status: body.status }),
    })
    .eq('id', menuItemId)
    .eq('store_id', storeId)
    .select(MENU_ITEM_SELECT)
    .single();

  if (error) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  if (!data) throw new AppError(ERROR_CODE.MENU_ITEM_NOT_FOUND, 404);

  return mapMenuItemRow(data as unknown as MenuItemRow);
}

export async function deleteSellerMenuItem(
  storeId: string,
  menuItemId: string
): Promise<null> {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('menu_items')
    .update({ status: 'inactive' })
    .eq('id', menuItemId)
    .eq('store_id', storeId)
    .select('id')
    .maybeSingle();

  if (error) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  if (!data) throw new AppError(ERROR_CODE.MENU_ITEM_NOT_FOUND, 404);

  return null;
}
