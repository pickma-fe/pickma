import { createServiceRoleClient } from '@/lib/supabase/service';

export async function expireUserOrders(userId: string): Promise<void> {
  try {
    const supabase = createServiceRoleClient();
    const { data: expired, error } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'payment_pending')
      .lt('expires_at', new Date().toISOString());
    if (error || !expired?.length) return;
    for (const order of expired) {
      try {
        await supabase.rpc('expire_order', { p_order_id: order.id });
      } catch {
        // best-effort cleanup: 개별 실패는 주문 생성을 막지 않는다.
      }
    }
  } catch {
    // best-effort cleanup: 조회/예상 밖 실패도 주문 생성을 막지 않는다.
  }
}
