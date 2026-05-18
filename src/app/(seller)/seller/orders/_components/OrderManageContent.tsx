'use client';

import {
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  UtensilsCrossed,
} from 'lucide-react';
import { useState } from 'react';

import { Section } from '@/components/common/Section/Section';
import { mockOrders } from '@/mocks/orders';

import { OrderFilter } from './OrderFilter';
import { OrderTable } from './OrderTable';

const STAT_CARDS = [
  {
    label: '전체',
    value: '전체',
    icon: Package,
    bgColor: 'bg-gray-100',
    iconColor: 'text-gray-600',
  },
  {
    label: '접수 대기',
    value: 'processing',
    icon: ShoppingBag,
    bgColor: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
  },
  {
    label: '준비 중',
    value: 'reserved',
    icon: UtensilsCrossed,
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    label: '준비 완료',
    value: 'ready',
    icon: Clock,
    bgColor: 'bg-primary-100',
    iconColor: 'text-primary-600',
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
];

export function OrderManageContent() {
  const [selectedStatus, setSelectedStatus] = useState('전체');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const getCount = (value: string) => {
    if (value === '전체') return mockOrders.length;
    return mockOrders.filter((o) => o.status === value).length;
  };

  const filteredOrders = mockOrders.filter((order) => {
    const matchStatus =
      selectedStatus === '전체' || order.status === selectedStatus;

    const matchSearch =
      searchKeyword === '' ||
      order.storeName.toLowerCase().includes(searchKeyword.toLowerCase());

    return matchStatus && matchSearch;
  });

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleSearchChange = (keyword: string) => {
    setSearchKeyword(keyword);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">
          주문 관리
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          접수된 주문을 확인하고, 픽업 상태를 관리할 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          const isSelected = selectedStatus === card.value;

          return (
            <button
              key={card.value}
              onClick={() => handleStatusChange(card.value)}
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

      <OrderTable
        orders={filteredOrders}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
