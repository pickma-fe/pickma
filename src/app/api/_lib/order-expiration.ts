import { createServerClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service';

export async function expireUserOrders(): Promise<void> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: expired, error } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'payment_pending')
      .lt('expires_at', new Date().toISOString());
    if (error || !expired?.length) return;

    const serviceSupabase = createServiceRoleClient();
    for (const order of expired) {
      try {
        const { error: rpcError } = await serviceSupabase.rpc('expire_order', {
          p_order_id: order.id,
        });
        if (rpcError) throw rpcError;
      } catch {
        // best-effort cleanup: 개별 실패는 주문 생성을 막지 않는다.
      }
    }
  } catch {
    // best-effort cleanup: 조회/예상 밖 실패도 주문 생성을 막지 않는다.
  }
}
