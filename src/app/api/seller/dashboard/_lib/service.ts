import type { SupabaseClient } from '@supabase/supabase-js';

import type { SellerDashboardStatsResponse } from '@/contracts/seller';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import type { Database } from '@/lib/supabase/database';

type DailyOrderRow = {
  created_at: string;
  payment_amount: number;
};

type RecentOrderRow = {
  id: string;
  order_number: string;
  payment_amount: number;
  status: SellerDashboardStatsResponse['recentOrders'][number]['status'];
  created_at: string;
  order_items: { product_name: string }[] | null;
};

const DAILY_METRIC_DAYS = 7;
const RECENT_ITEM_LIMIT = 5;
const KOREA_TIME_ZONE = 'Asia/Seoul';
const DAILY_METRIC_ORDER_STATUSES = [
  'reserved',
  'accepted',
  'ready',
  'completed',
  'no_show',
] satisfies SellerDashboardStatsResponse['recentOrders'][number]['status'][];

function getKoreanDateKey(value: Date | string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: KOREA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));
}

function getDailyMetricRange(now = new Date()): {
  start: string;
  end: string;
  dates: string[];
} {
  const todayKey = getKoreanDateKey(now);
  const end = new Date(`${todayKey}T00:00:00+09:00`);
  end.setUTCDate(end.getUTCDate() + 1);

  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - DAILY_METRIC_DAYS);

  const dates = Array.from({ length: DAILY_METRIC_DAYS }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    return getKoreanDateKey(date);
  });

  return {
    start: start.toISOString(),
    end: end.toISOString(),
    dates,
  };
}

async function getDailyMetrics(
  supabase: SupabaseClient<Database>,
  storeId: string
): Promise<SellerDashboardStatsResponse['dailyMetrics']> {
  const { start, end, dates } = getDailyMetricRange();

  const { data, error } = await supabase
    .from('orders')
    .select('created_at, payment_amount')
    .eq('store_id', storeId)
    .in('status', DAILY_METRIC_ORDER_STATUSES)
    .gte('created_at', start)
    .lt('created_at', end);

  if (error) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  const metricsByDate = Object.fromEntries(
    dates.map((date) => [
      date,
      {
        date: new Date(`${date}T00:00:00+09:00`).toISOString(),
        orderCount: 0,
        salesAmount: 0,
      },
    ])
  );

  for (const order of (data ?? []) as DailyOrderRow[]) {
    const key = getKoreanDateKey(order.created_at);
    const metric = metricsByDate[key];
    if (!metric) continue;

    metric.orderCount += 1;
    metric.salesAmount += order.payment_amount;
  }

  return dates.map((date) => metricsByDate[date]);
}

async function getTotalStats(
  supabase: SupabaseClient<Database>,
  storeId: string
): Promise<{ totalSalesAmount: number; totalOrderCount: number }> {
  const { data, error } = await supabase
    .from('orders')
    .select('payment_amount')
    .eq('store_id', storeId)
    .in('status', DAILY_METRIC_ORDER_STATUSES);

  if (error) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  const rows = (data ?? []) as { payment_amount: number }[];

  return {
    totalOrderCount: rows.length,
    totalSalesAmount: rows.reduce((sum, row) => sum + row.payment_amount, 0),
  };
}

async function getRecentOrders(
  supabase: SupabaseClient<Database>,
  storeId: string
): Promise<SellerDashboardStatsResponse['recentOrders']> {
  const { data, error } = await supabase
    .from('orders')
    .select(
      'id, order_number, payment_amount, status, created_at, order_items(product_name)'
    )
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })
    .limit(RECENT_ITEM_LIMIT);

  if (error) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  return ((data ?? []) as RecentOrderRow[]).map((order) => ({
    id: order.id,
    orderNumber: order.order_number,
    productName: order.order_items?.[0]?.product_name ?? '주문 상품',
    paymentAmount: order.payment_amount,
    status: order.status,
    createdAt: order.created_at,
  }));
}

export async function getSellerDashboardStats(
  supabase: SupabaseClient<Database>,
  storeId: string
): Promise<SellerDashboardStatsResponse> {
  const [{ totalSalesAmount, totalOrderCount }, dailyMetrics, recentOrders] =
    await Promise.all([
      getTotalStats(supabase, storeId),
      getDailyMetrics(supabase, storeId),
      getRecentOrders(supabase, storeId),
    ]);

  return {
    totalSalesAmount,
    totalOrderCount,
    dailyMetrics,
    recentOrders,
  };
}
