import { ShoppingBag, TrendingUp } from 'lucide-react';

import { Section } from '@/components/common/Section/Section';

interface SalesSummaryCardsProps {
  totalSalesAmount: number;
  totalOrderCount: number;
  isLoading: boolean;
}

const SUMMARY_CARDS = [
  {
    key: 'totalSalesAmount' as const,
    label: '누적 매출',
    icon: TrendingUp,
    bgColor: 'bg-primary-50',
    iconColor: 'text-primary-500',
    format: (v: number) => `${v.toLocaleString('ko-KR')}원`,
  },
  {
    key: 'totalOrderCount' as const,
    label: '누적 주문',
    icon: ShoppingBag,
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-500',
    format: (v: number) => `${v.toLocaleString('ko-KR')}건`,
  },
] as const;

export function SalesSummaryCards({
  totalSalesAmount,
  totalOrderCount,
  isLoading,
}: SalesSummaryCardsProps) {
  const values = { totalSalesAmount, totalOrderCount };

  return (
    <div className="grid grid-cols-2 gap-3">
      {SUMMARY_CARDS.map((card) => {
        const Icon = card.icon;

        return (
          <Section key={card.key} variant="card" className="bg-white">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${card.bgColor}`}
              >
                <Icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-xl font-bold text-gray-900">
                  {isLoading ? (
                    <span className="text-base text-gray-400">집계 중...</span>
                  ) : (
                    card.format(values[card.key])
                  )}
                </p>
              </div>
            </div>
          </Section>
        );
      })}
    </div>
  );
}
