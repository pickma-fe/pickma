'use client';

import {
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
} from 'lucide-react';
import { useState } from 'react';

import { Section } from '@/components/common/Section/Section';
import { mockOrders } from '@/mocks/orders';

import { OrderFilter } from './OrderFilter';

const STAT_CARDS = [
  {
    label: '전체',
    value: '전체',
    icon: Package,
    bgColor: 'bg-gray-100',
    iconColor: 'text-gray-600',
  },
  {
    label: '수락 대기',
    value: 'processing',
    icon: ShoppingBag,
    bgColor: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
  },
  {
    label: '픽업 대기',
    value: 'reserved',
    icon: Clock,
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    label: '픽업 완료',
    value: 'completed',
    icon: CheckCircle,
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    label: '취소/환불',
    value: 'cancelled',
    icon: XCircle,
    bgColor: 'bg-red-100',
    iconColor: 'text-red-600',
  },
  {
    label: '미수령',
    value: 'no_show',
    icon: AlertCircle,
    bgColor: 'bg-gray-100',
    iconColor: 'text-gray-600',
  },
];

export function OrderManageContent() {
  const [selectedStatus, setSelectedStatus] = useState('전체');
  const [searchKeyword, setSearchKeyword] = useState('');

  const getCount = (value: string) => {
    if (value === '전체') return mockOrders.length;
    if (value === 'reserved')
      return mockOrders.filter(
        (o) => o.status === 'reserved' || o.status === 'ready'
      ).length;
    return mockOrders.filter((o) => o.status === value).length;
  };

  const filteredOrders = mockOrders.filter((order) => {
    const matchStatus =
      selectedStatus === '전체' ||
      (selectedStatus === 'reserved'
        ? order.status === 'reserved' || order.status === 'ready'
        : order.status === selectedStatus);

    const matchSearch =
      searchKeyword === '' ||
      order.storeName.toLowerCase().includes(searchKeyword.toLowerCase());

    return matchStatus && matchSearch;
  });

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
  };

  const handleSearchChange = (keyword: string) => {
    setSearchKeyword(keyword);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">
          주문 관리
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          주문 현황을 확인하고, 판매 상태를 설정할 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          const isSelected = selectedStatus === card.value;

          return (
            <button
              key={card.value}
              onClick={() => setSelectedStatus(card.value)}
              className="text-left"
            >
              <Section
                variant="card"
                className={`bg-white transition-all ${
                  isSelected
                    ? 'ring-primary-500 ring-2'
                    : 'hover:ring-1 hover:ring-gray-300'
                }`}
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
                      {getCount(card.value)}
                      <span className="text-base font-normal text-gray-500">
                        건
                      </span>
                    </p>
                  </div>
                </div>
              </Section>
            </button>
          );
        })}
      </div>

      <OrderFilter
        selectedStatus={selectedStatus}
        searchKeyword={searchKeyword}
        onStatusChange={handleStatusChange}
        onSearchChange={handleSearchChange}
      />

      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
        <p>필터링된 주문: {filteredOrders.length}건</p>
        <p className="mt-2 text-sm">테이블 컴포넌트 구현 예정</p>
      </div>
    </div>
  );
}
