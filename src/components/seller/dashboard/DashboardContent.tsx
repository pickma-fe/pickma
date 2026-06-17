'use client';

import {
  AlertCircle,
  CheckCircle,
  ClipboardList,
  PackageCheck,
  ShoppingBag,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';

import { useSellerOrders } from '@/hooks/seller/orders/useSellerOrders';
import { Button } from '@/components/common/Button/Button';
import { Section } from '@/components/common/Section/Section';

const TODAY_PAGE_SIZE = 100;

function getTodayRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

const STATUS_CARDS = [
  {
    label: '수락 대기',
    status: 'reserved' as const,
    icon: ShoppingBag,
    bgColor: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
  },
  {
    label: '주문 승인',
    status: 'accepted' as const,
    icon: ClipboardList,
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    label: '픽업 대기',
    status: 'ready' as const,
    icon: PackageCheck,
    bgColor: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
  },
  {
    label: '픽업 완료',
    status: 'completed' as const,
    icon: CheckCircle,
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    label: '취소/환불',
    status: 'cancelled' as const,
    icon: XCircle,
    bgColor: 'bg-red-100',
    iconColor: 'text-red-600',
  },
  {
    label: '미수령',
    status: 'noShow' as const,
    icon: AlertCircle,
    bgColor: 'bg-gray-100',
    iconColor: 'text-gray-600',
  },
] as const;

type DashboardOrderStatus = (typeof STATUS_CARDS)[number]['status'];

export function DashboardContent() {
  const today = getTodayRange();

  const { data, isLoading, isError } = useSellerOrders({
    page: 1,
    pageSize: TODAY_PAGE_SIZE,
    sort: 'createdAt',
    order: 'desc',
  });

  const todayOrders = (data?.items ?? []).filter((order) => {
    const createdAt = new Date(order.createdAt).getTime();
    return (
      createdAt >= today.start.getTime() && createdAt < today.end.getTime()
    );
  });

  const getCount = (status: DashboardOrderStatus): number => {
    return todayOrders.filter((order) => order.status === status).length;
  };

  const todayTotal = todayOrders.length;

  const formattedDate = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">
          대시보드
        </h1>
        <p className="mt-1 text-sm text-gray-500">{formattedDate}</p>
      </div>

      <Section variant="card" className="bg-white">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            오늘의 주문 현황
          </h2>
          <span className="text-sm text-gray-500">
            {isLoading ? (
              <span className="text-gray-400">집계 중...</span>
            ) : (
              <>
                총{' '}
                <span className="font-semibold text-gray-900">
                  {todayTotal}
                </span>
                건
              </>
            )}
          </span>
        </div>

        {isError && (
          <div
            role="alert"
            className="mb-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            주문 현황을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {STATUS_CARDS.map((card) => {
            const Icon = card.icon;
            const count = getCount(card.status);

            return (
              <Link
                key={card.status}
                href={`/seller/orders?status=${card.status}`}
                className="block"
              >
                <Section
                  variant="card"
                  className="bg-white transition-all hover:ring-1 hover:ring-gray-300"
                >
                  <div className="flex flex-col gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${card.bgColor}`}
                    >
                      <Icon className={`h-5 w-5 ${card.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{card.label}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {isLoading ? (
                          <span className="text-base text-gray-400">...</span>
                        ) : (
                          <>
                            {count}
                            <span className="text-base font-normal text-gray-500">
                              건
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </Section>
              </Link>
            );
          })}
        </div>
      </Section>

      <Section variant="card" className="bg-white">
        <h2 className="mb-4 text-base font-semibold text-gray-900">
          빠른 이동
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: '가게 정보', href: '/seller/store' },
            { label: '메뉴 관리', href: '/seller/menu' },
            { label: '상품 관리', href: '/seller/products' },
            { label: '주문 관리', href: '/seller/orders' },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <Button variant="outline" color="gray" className="w-full">
                {item.label}
              </Button>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}
