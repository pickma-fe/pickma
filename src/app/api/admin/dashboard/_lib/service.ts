import type { AdminDashboardStatsResponse } from '@/contracts/admin';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';

type CountTarget = 'stores' | 'menu_items' | 'orders' | 'users';
type ServiceRoleClient = ReturnType<typeof createServiceRoleClient>;
type DailyOrderRow = {
  created_at: string;
  payment_amount: number;
};
type PendingApplicationRow = {
  id: string;
  company_name: string;
  business_category: string;
  created_at: string;
};
type RecentOrderRow = {
  id: string;
  payment_amount: number;
  status: AdminDashboardStatsResponse['recentOrders'][number]['status'];
  created_at: string;
  stores: { name: string } | null;
  order_items: { product_name: string }[] | null;
};
type RecentUserRow = {
  id: string;
  name: string;
  email: string;
  created_at: string;
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
] satisfies AdminDashboardStatsResponse['recentOrders'][number]['status'][];

async function countRows(
  supabase: ServiceRoleClient,
  table: CountTarget
): Promise<number> {
  const { error, count } = await supabase
    .from(table)
    .select('id', { count: 'exact', head: true });

  if (error) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  return count ?? 0;
}

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
  supabase: ServiceRoleClient
): Promise<AdminDashboardStatsResponse['dailyMetrics']> {
  const { start, end, dates } = getDailyMetricRange();
  const { data, error } = await supabase
    .from('orders')
    .select('created_at, payment_amount')
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

async function getRecentPendingApplications(
  supabase: ServiceRoleClient
): Promise<AdminDashboardStatsResponse['recentPendingApplications']> {
  const { data, error } = await supabase
    .from('seller_applications')
    .select('id, company_name, business_category, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  return ((data ?? []) as PendingApplicationRow[]).map((application) => ({
    id: application.id,
    companyName: application.company_name,
    businessCategory: application.business_category,
    createdAt: application.created_at,
  }));
}

async function getRecentOrders(
  supabase: ServiceRoleClient
): Promise<AdminDashboardStatsResponse['recentOrders']> {
  const { data, error } = await supabase
    .from('orders')
    .select(
      'id, payment_amount, status, created_at, stores(name), order_items(product_name)'
    )
    .order('created_at', { ascending: false })
    .limit(RECENT_ITEM_LIMIT);

  if (error) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  return ((data ?? []) as RecentOrderRow[]).map((order) => ({
    id: order.id,
    productName: order.order_items?.[0]?.product_name ?? '주문 상품',
    storeName: order.stores?.name ?? '가게 정보 없음',
    paymentAmount: order.payment_amount,
    status: order.status,
    createdAt: order.created_at,
  }));
}

async function getRecentUsers(
  supabase: ServiceRoleClient
): Promise<AdminDashboardStatsResponse['recentUsers']> {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, created_at')
    .order('created_at', { ascending: false })
    .limit(RECENT_ITEM_LIMIT);

  if (error) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  return ((data ?? []) as RecentUserRow[]).map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.created_at,
  }));
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStatsResponse> {
  const supabase = createServiceRoleClient();
  const [
    totalStores,
    totalProducts,
    totalOrders,
    totalUsers,
    dailyMetrics,
    recentPendingApplications,
    recentOrders,
    recentUsers,
  ] = await Promise.all([
    countRows(supabase, 'stores'),
    countRows(supabase, 'menu_items'),
    countRows(supabase, 'orders'),
    countRows(supabase, 'users'),
    getDailyMetrics(supabase),
    getRecentPendingApplications(supabase),
    getRecentOrders(supabase),
    getRecentUsers(supabase),
  ]);

  return {
    totalStores,
    totalProducts,
    totalOrders,
    totalUsers,
    dailyMetrics,
    recentPendingApplications,
    recentOrders,
    recentUsers,
  };
}
