import type { SellerDashboardDailyMetricResponse } from '@/contracts/seller';

interface SalesDailyChartProps {
  dailyMetrics: SellerDashboardDailyMetricResponse[];
  isLoading: boolean;
}

function formatDateLabel(isoDate: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: 'numeric',
    day: 'numeric',
  }).format(new Date(isoDate));
}

const BAR_HEIGHT_STEPS: [number, string][] = [
  [0, 'h-0'],
  [10, 'h-2.5'],
  [20, 'h-5'],
  [30, 'h-7'],
  [40, 'h-9'],
  [50, 'h-12'],
  [60, 'h-14'],
  [70, 'h-16'],
  [80, 'h-20'],
  [90, 'h-[5.5rem]'],
  [Infinity, 'h-24'],
];

function getBarHeightClass(percent: number): string {
  return (
    BAR_HEIGHT_STEPS.find(([threshold]) => percent <= threshold)?.[1] ?? 'h-24'
  );
}

export function SalesDailyChart({
  dailyMetrics,
  isLoading,
}: SalesDailyChartProps) {
  const maxSales = Math.max(...dailyMetrics.map((m) => m.salesAmount), 1);

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <span className="text-sm text-gray-400">집계 중...</span>
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-medium text-gray-700">
        최근 7일 매출 추이
      </h3>
      <div
        className="flex items-end gap-2"
        role="img"
        aria-label="최근 7일 매출 막대 차트"
      >
        {dailyMetrics.map((metric) => {
          const heightPercent =
            maxSales > 0 ? (metric.salesAmount / maxSales) * 100 : 0;
          const barHeightClass = getBarHeightClass(heightPercent);

          return (
            <div
              key={metric.date}
              className="flex flex-1 flex-col items-center gap-1"
            >
              <span className="text-xs text-gray-500">
                {metric.salesAmount > 0
                  ? `${Math.round(metric.salesAmount / 1000)}K`
                  : '-'}
              </span>
              <div className="relative h-24 w-full">
                <div className="h-full w-full rounded-sm bg-gray-100" />
                <div
                  className={`bg-primary-400 absolute bottom-0 w-full rounded-sm transition-all duration-300 ${barHeightClass}`}
                  aria-label={`${formatDateLabel(metric.date)}: ${metric.salesAmount.toLocaleString('ko-KR')}원, ${metric.orderCount}건`}
                />
              </div>
              <span className="text-xs text-gray-500">
                {formatDateLabel(metric.date)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
