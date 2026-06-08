import type { LucideIcon } from 'lucide-react';

interface AdminDashboardStatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  isLoading?: boolean;
}

const NUMBER_FORMATTER = new Intl.NumberFormat('ko-KR');

export function AdminDashboardStatCard({
  label,
  value,
  icon: Icon,
  isLoading = false,
}: AdminDashboardStatCardProps) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          {isLoading ? (
            <div
              className="mt-3 h-8 w-24 animate-pulse rounded bg-gray-100"
              aria-label={`${label} 불러오는 중`}
            />
          ) : (
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {NUMBER_FORMATTER.format(value)}
            </p>
          )}
        </div>
        <div className="bg-primary-50 text-primary-500 flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
      </div>
    </article>
  );
}
