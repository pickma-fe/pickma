import type { DailyAdminMetric } from '@/types/admin';

import { AdminCard } from './AdminCard';

interface AdminDashboardDailyChartProps {
  metrics: DailyAdminMetric[];
}

const CURRENCY_FORMATTER = new Intl.NumberFormat('ko-KR');
const DATE_FORMATTER = new Intl.DateTimeFormat('ko-KR', {
  month: '2-digit',
  day: '2-digit',
});
const TOOLTIP_WIDTH = 150;
const TOOLTIP_HEIGHT = 66;
const ORDER_LINE_HEIGHT_RATIO = 0.88;
const SALES_BAR_HEIGHT_RATIO = 0.72;

function formatDateLabel(date: Date): string {
  return DATE_FORMATTER.format(date).replace(/\.$/, '').replace('. ', '.');
}

function getTooltipX(x: number, chartRight: number): number {
  if (x + TOOLTIP_WIDTH / 2 > chartRight) {
    return chartRight - TOOLTIP_WIDTH;
  }

  return Math.max(8, x - TOOLTIP_WIDTH / 2);
}

export function AdminDashboardDailyChart({
  metrics,
}: AdminDashboardDailyChartProps) {
  if (metrics.length === 0) {
    return (
      <AdminCard title="일별 주문/매출 현황">
        <div className="flex min-h-64 items-center justify-center text-sm text-gray-500">
          집계 데이터가 없습니다.
        </div>
      </AdminCard>
    );
  }

  const maxOrderCount = Math.max(
    ...metrics.map((metric) => metric.orderCount),
    1
  );
  const maxSalesAmount = Math.max(
    ...metrics.map((metric) => metric.salesAmount),
    1
  );
  const width = 720;
  const height = 260;
  const chartTop = 24;
  const chartBottom = 206;
  const chartLeft = 40;
  const chartRight = 690;
  const chartHeight = chartBottom - chartTop;
  const step =
    metrics.length > 1 ? (chartRight - chartLeft) / (metrics.length - 1) : 0;

  const points = metrics.map((metric, index) => {
    const x = chartLeft + step * index;
    const y =
      chartBottom -
      (metric.orderCount / maxOrderCount) *
        chartHeight *
        ORDER_LINE_HEIGHT_RATIO;
    return { x, y };
  });
  const linePoints = points.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <AdminCard title="일별 주문/매출 현황">
      <div className="mb-4 flex flex-wrap items-center gap-4 text-sm">
        <span className="flex items-center gap-2 text-gray-600">
          <span className="bg-primary-500 h-2.5 w-2.5 rounded-full" />
          주문 수
        </span>
        <span className="flex items-center gap-2 text-gray-600">
          <span className="bg-primary-100 h-2.5 w-2.5 rounded-full" />
          매출액
        </span>
      </div>
      <div className="overflow-x-auto">
        <svg
          role="img"
          aria-label="최근 7일 주문 수와 매출액 추이"
          viewBox={`0 0 ${width} ${height}`}
          className="min-w-[680px]"
        >
          {[0, 1, 2, 3].map((line) => {
            const y = chartTop + (chartHeight / 3) * line;
            return (
              <line
                key={line}
                x1={chartLeft}
                x2={chartRight}
                y1={y}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            );
          })}
          {metrics.map((metric, index) => {
            const x = chartLeft + step * index;
            const barHeight =
              (metric.salesAmount / maxSalesAmount) *
              chartHeight *
              SALES_BAR_HEIGHT_RATIO;
            return (
              <g key={metric.date.toISOString()}>
                <rect
                  x={x - 9}
                  y={chartBottom - barHeight}
                  width="18"
                  height={barHeight}
                  rx="4"
                  fill="#dff3e9"
                />
                <text
                  x={x}
                  y={height - 18}
                  textAnchor="middle"
                  className="fill-gray-500 text-xs"
                >
                  {formatDateLabel(metric.date)}
                </text>
              </g>
            );
          })}
          <polyline
            points={linePoints}
            fill="none"
            stroke="#009C4A"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {points.map((point, index) => {
            const metric = metrics[index];
            if (!metric) return null;
            const tooltipX = getTooltipX(point.x, chartRight);
            const tooltipY = Math.max(4, point.y - TOOLTIP_HEIGHT - 14);
            const metricLabel = `${formatDateLabel(metric.date)} 주문 ${CURRENCY_FORMATTER.format(metric.orderCount)}건, 매출 ${CURRENCY_FORMATTER.format(metric.salesAmount)}원`;

            return (
              <g
                key={`${point.x}-${point.y}`}
                tabIndex={0}
                role="img"
                aria-label={metricLabel}
                className="group cursor-pointer outline-none"
              >
                <rect
                  x={point.x - Math.max(step / 2, 24)}
                  y={chartTop}
                  width={Math.max(step, 48)}
                  height={chartBottom - chartTop}
                  fill="transparent"
                />
                <line
                  x1={point.x}
                  x2={point.x}
                  y1={chartTop}
                  y2={chartBottom}
                  stroke="#d1d5db"
                  strokeDasharray="4 4"
                  className="opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100"
                />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="#fff"
                  stroke="#009C4A"
                  strokeWidth="3"
                />
                <g className="pointer-events-none opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100">
                  <rect
                    x={tooltipX}
                    y={tooltipY}
                    width={TOOLTIP_WIDTH}
                    height={TOOLTIP_HEIGHT}
                    rx="8"
                    fill="#fff"
                    stroke="#e5e7eb"
                    strokeWidth="1"
                    className="drop-shadow-sm"
                  />
                  <text
                    x={tooltipX + 12}
                    y={tooltipY + 20}
                    className="fill-gray-900 text-xs font-semibold"
                  >
                    {formatDateLabel(metric.date)}
                  </text>
                  <text
                    x={tooltipX + 12}
                    y={tooltipY + 38}
                    className="fill-gray-600 text-xs"
                  >
                    주문 {CURRENCY_FORMATTER.format(metric.orderCount)}건
                  </text>
                  <text
                    x={tooltipX + 12}
                    y={tooltipY + 54}
                    className="fill-gray-600 text-xs"
                  >
                    매출 {CURRENCY_FORMATTER.format(metric.salesAmount)}원
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>
    </AdminCard>
  );
}
