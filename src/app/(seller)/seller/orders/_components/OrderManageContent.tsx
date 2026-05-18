'use client';

import {
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

import { Section } from '@/components/common/Section/Section';
import { mockOrders } from '@/mocks/orders';

export function OrderManageContent() {
  const processingCount = mockOrders.filter(
    (o) => o.status === 'processing'
  ).length;
  const reservedCount = mockOrders.filter(
    (o) => o.status === 'reserved' || o.status === 'ready'
  ).length;
  const completedCount = mockOrders.filter(
    (o) => o.status === 'completed'
  ).length;
  const cancelledCount = mockOrders.filter(
    (o) => o.status === 'cancelled'
  ).length;
  const noShowCount = mockOrders.filter((o) => o.status === 'no_show').length;

  return (
    <div className="flex flex-col gap-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">
          주문 관리
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          주문 현황을 확인하고, 판매 상태를 설정할 수 있습니다.
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Section variant="card" className="bg-white">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <ShoppingBag className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">수락 대기</p>
              <p className="text-2xl font-bold text-gray-900">
                {processingCount}
                <span className="text-base font-normal text-gray-500">건</span>
              </p>
            </div>
          </div>
        </Section>

        <Section variant="card" className="bg-white">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">픽업 대기</p>
              <p className="text-2xl font-bold text-gray-900">
                {reservedCount}
                <span className="text-base font-normal text-gray-500">건</span>
              </p>
            </div>
          </div>
        </Section>

        <Section variant="card" className="bg-white">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">픽업 완료</p>
              <p className="text-2xl font-bold text-gray-900">
                {completedCount}
                <span className="text-base font-normal text-gray-500">건</span>
              </p>
            </div>
          </div>
        </Section>

        <Section variant="card" className="bg-white">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">취소/환불</p>
              <p className="text-2xl font-bold text-gray-900">
                {cancelledCount}
                <span className="text-base font-normal text-gray-500">건</span>
              </p>
            </div>
          </div>
        </Section>

        <Section variant="card" className="bg-white">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <AlertCircle className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">미수령</p>
              <p className="text-2xl font-bold text-gray-900">
                {noShowCount}
                <span className="text-base font-normal text-gray-500">건</span>
              </p>
            </div>
          </div>
        </Section>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4 text-center text-gray-500">
        <p className="text-sm">필터 컴포넌트 구현 예정</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
        <p className="text-sm">테이블 컴포넌트 구현 예정</p>
      </div>
    </div>
  );
}
