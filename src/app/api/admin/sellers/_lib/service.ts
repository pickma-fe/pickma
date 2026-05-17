import type { AdminPendingSellerApplicationListResponse } from '@/contracts/admin';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';

import {
  toAdminPendingSellerApplicationListResponse,
  toAdminPendingSellerApplicationResponse,
} from './mapper';

export async function getPendingSellerApplications(
  page: number,
  pageSize: number
): Promise<AdminPendingSellerApplicationListResponse> {
  const supabase = createServiceRoleClient();

  const offset = (page - 1) * pageSize;

  const {
    data: applications,
    error: appError,
    count,
  } = await supabase
    .from('seller_applications')
    .select('*', { count: 'exact' })
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (appError) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  if (!applications || applications.length === 0) {
    return toAdminPendingSellerApplicationListResponse(
      [],
      count ?? 0,
      page,
      pageSize
    );
  }

  const userIds = [...new Set(applications.map((a) => a.user_id))];
  const applicationIds = applications.map((a) => a.id);

  const [usersResult, documentsResult] = await Promise.all([
    supabase.from('users').select('id, email, name, phone').in('id', userIds),
    supabase
      .from('seller_application_documents')
      .select('*')
      .in('application_id', applicationIds),
  ]);

  if (usersResult.error || documentsResult.error) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  const usersById = Object.fromEntries(
    (usersResult.data ?? []).map((u) => [u.id, u])
  );
  const documentsByApplicationId = (documentsResult.data ?? []).reduce<
    Record<string, typeof documentsResult.data>
  >((acc, doc) => {
    if (!acc[doc.application_id]) acc[doc.application_id] = [];
    acc[doc.application_id]?.push(doc);
    return acc;
  }, {});

  const items = applications.map((app) => {
    const user = usersById[app.user_id];
    if (!user) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
    return toAdminPendingSellerApplicationResponse(
      app,
      { email: user.email, name: user.name, phone: user.phone },
      documentsByApplicationId[app.id] ?? []
    );
  });

  return toAdminPendingSellerApplicationListResponse(
    items,
    count ?? 0,
    page,
    pageSize
  );
}

export async function approveSellerApplication(id: string): Promise<void> {
  const supabase = createServiceRoleClient();

  const { data: application, error: findError } = await supabase
    .from('seller_applications')
    .select('id')
    .eq('id', id)
    .single();

  if (findError) {
    if (findError.code === 'PGRST116') {
      throw new AppError(ERROR_CODE.SELLER_APPLICATION_NOT_FOUND, 404);
    }
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }
  if (!application) {
    throw new AppError(ERROR_CODE.SELLER_APPLICATION_NOT_FOUND, 404);
  }

  const { error: rpcError } = await supabase.rpc('approve_seller_application', {
    application_id: id,
  });

  if (rpcError) {
    throw new AppError(ERROR_CODE.VALIDATION_ERROR, 400);
  }
}

export async function rejectSellerApplication(
  id: string,
  reason: string
): Promise<void> {
  const supabase = createServiceRoleClient();

  const { data: application, error: findError } = await supabase
    .from('seller_applications')
    .select('id')
    .eq('id', id)
    .single();

  if (findError) {
    if (findError.code === 'PGRST116') {
      throw new AppError(ERROR_CODE.SELLER_APPLICATION_NOT_FOUND, 404);
    }
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }
  if (!application) {
    throw new AppError(ERROR_CODE.SELLER_APPLICATION_NOT_FOUND, 404);
  }

  const { data: updated, error: updateError } = await supabase
    .from('seller_applications')
    .update({
      status: 'rejected',
      reject_reason: reason,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('status', 'pending')
    .select('id');

  if (updateError) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  if (!updated || updated.length === 0) {
    throw new AppError(ERROR_CODE.VALIDATION_ERROR, 400);
  }
}
