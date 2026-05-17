import type { SellerOnboardingStatusResponse } from '@/contracts/seller-application';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';

export interface OnboardingStatusData {
  role: SellerOnboardingStatusResponse['role'];
  applicationStatus: 'none' | 'pending' | 'approved' | 'rejected';
  hasStore: boolean;
  latestRejectReason?: string;
}

export async function getSellerOnboardingStatus(
  userId: string
): Promise<OnboardingStatusData> {
  const supabase = createServiceRoleClient();

  const [userResult, applicationResult, storeResult] = await Promise.all([
    supabase.from('users').select('role').eq('id', userId).single(),
    supabase
      .from('seller_applications')
      .select('status, reject_reason')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1),
    supabase.from('stores').select('id').eq('user_id', userId).limit(1),
  ]);

  if (userResult.error || applicationResult.error || storeResult.error) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  const role = userResult.data?.role ?? 'customer';

  let applicationStatus: OnboardingStatusData['applicationStatus'] = 'none';
  let latestRejectReason: string | undefined;

  if (applicationResult.data && applicationResult.data.length > 0) {
    const latest = applicationResult.data[0];
    applicationStatus = latest.status;
    if (latest.status === 'rejected' && latest.reject_reason) {
      latestRejectReason = latest.reject_reason;
    }
  }

  const hasStore = Boolean(storeResult.data && storeResult.data.length > 0);

  return {
    role,
    applicationStatus,
    hasStore,
    ...(latestRejectReason !== undefined && { latestRejectReason }),
  };
}
