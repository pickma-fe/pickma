'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import type { Order } from '@/types/order';
import type {
  SellerOrderActionStatus,
  SellerOrderDisplayStatus,
} from '@/types/seller-order';
import { Badge } from '@/components/common/Badge/Badge';
import type { ActionMenuItem } from '@/components/common/Dropdown/ActionsMenu';
import { ActionsMenu } from '@/components/common/Dropdown/ActionsMenu';
import { Pagination } from '@/components/common/Pagination/Pagination';
import { Tooltip } from '@/components/common/Tooltip/Tooltip';

type SellerOrderListItem = Omit<Order, 'items' | 'payment'>;

interface OrderTableProps {
  orders: SellerOrderListItem[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onOrderAction: (orderId: string, newStatus: SellerOrderActionStatus) => void;
  onCancelRequest: (orderId: string) => void;
  isLoading?: boolean;
  isError?: boolean;
  isActionPending?: boolean;
}

const formatPrice = (price: number) => price.toLocaleString('ko-KR') + '원';

const formatDate = (date: Date) =>
  `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;

const formatTime = (date: Date) => {
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const period = hours >= 12 ? '오후' : '오전';
  const displayHours = String(hours % 12 || 12).padStart(2, '0');
  return `${period} ${displayHours}:${minutes}`;
};

const STATUS_BADGE: Record<
  SellerOrderDisplayStatus,
  { label: string; color: 'warning' | 'info' | 'success' | 'danger' | 'gray' }
> = {
  reserved: { label: '수락 대기', color: 'warning' },
  accepted: { label: '주문 승인', color: 'info' },
  ready: { label: '픽업 대기', color: 'info' },
  completed: { label: '픽업 완료', color: 'success' },
  cancelling: { label: '취소 처리 중', color: 'warning' },
  cancelled: { label: '취소/환불', color: 'danger' },
  noShow: { label: '미수령', color: 'gray' },
};

const STATUS_DESCRIPTION: Record<SellerOrderDisplayStatus, string> = {
  reserved: '주문을 수락하거나 취소해주세요.',
  accepted: '주문 상품을 준비해주세요.',
  ready: '고객 픽업을 기다리고 있습니다.',
  completed: '픽업이 완료되었습니다.',
  cancelling: '결제 취소 처리 중입니다.',
  cancelled: '주문이 취소/환불되었습니다.',
  noShow: '고객이 미수령하였습니다.',
};

function isSellerDisplayStatus(
  status: Order['status']
): status is SellerOrderDisplayStatus {
  return status in STATUS_BADGE;
}

function buildOrderActionItems(
  order: SellerOrderListItem,
  onOrderAction: (orderId: string, newStatus: SellerOrderActionStatus) => void,
  onCancelRequest: (orderId: string) => void,
  onDetail: () => void,
  isActionPending: boolean
): ActionMenuItem[] {
  const items: ActionMenuItem[] = [];

  switch (order.status) {
    case 'reserved':
      items.push(
        {
          id: 'accept',
          label: '주문 접수',
          onClick: () => onOrderAction(order.id, 'accepted'),
          disabled: isActionPending,
        },
        {
          id: 'cancel',
          label: '주문 취소',
          onClick: () => onCancelRequest(order.id),
          disabled: isActionPending,
          variant: 'danger',
        }
      );
      break;
    case 'accepted':
      items.push(
        {
          id: 'ready',
          label: '준비 완료',
          onClick: () => onOrderAction(order.id, 'ready'),
          disabled: isActionPending,
        },
        {
          id: 'cancel',
          label: '주문 취소',
          onClick: () => onCancelRequest(order.id),
          disabled: isActionPending,
          variant: 'danger',
        }
      );
      break;
    case 'ready':
      items.push({
        id: 'complete',
        label: '픽업 완료',
        onClick: () => onOrderAction(order.id, 'completed'),
        disabled: isActionPending,
      });
      break;
  }

  items.push({ id: 'detail', label: '상세 보기', onClick: onDetail });
  return items;
}

export function OrderTable({
  orders,
  currentPage,
  totalPages,
  onPageChange,
  onOrderAction,
  onCancelRequest,
  isLoading = false,
  isError = false,
  isActionPending = false,
}: OrderTableProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex min-h-75 items-center justify-center rounded-lg border border-gray-200 bg-white">
        <p className="text-sm text-gray-500">주문 목록을 불러오는 중...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-75 items-center justify-center rounded-lg border border-gray-200 bg-white">
        <div className="text-center">
          <p className="text-sm text-gray-500">
            주문 목록을 불러오지 못했습니다.
          </p>
          <p className="text-xs text-gray-400">잠시 후 다시 시도해주세요.</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0 && totalPages === 0) {
    return (
      <div className="flex min-h-75 items-center justify-center rounded-lg border border-gray-200 bg-white">
        <div className="text-center">
          <p className="text-sm text-gray-500">주문 내역이 없습니다.</p>
          <p className="text-xs text-gray-400">아직 접수된 주문이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <caption className="sr-only">주문 목록</caption>
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th
                scope="col"
                className="px-4 py-3 text-left text-sm font-medium text-gray-500"
              >
                주문 정보
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap text-gray-500"
              >
                주문 금액
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap text-gray-500"
              >
                픽업 정보
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap text-gray-500"
              >
                주문 상태
              </th>
              <th
                scope="col"
                className="w-fit px-4 py-3 text-left text-sm font-medium whitespace-nowrap text-gray-500"
              >
                관리
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-16 text-center text-sm text-gray-500"
                >
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              orders.map((order, index) => {
                if (!isSellerDisplayStatus(order.status)) return null;

                const badge = STATUS_BADGE[order.status];
                const description = STATUS_DESCRIPTION[order.status];

                return (
                  <tr
                    key={order.id}
                    className={`hover:bg-gray-50 ${
                      index !== orders.length - 1
                        ? 'border-b border-gray-100'
                        : ''
                    }`}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {order.image ? (
                            <Image
                              src={order.image}
                              alt=""
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                              🛍️
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-medium text-gray-900">
                            {order.orderNumber}
                          </p>
                          <p className="text-xs text-gray-400">
                            {order.storeName}
                          </p>
                          <p className="text-xs text-gray-400">
                            주문일 {formatDate(order.createdAt)}{' '}
                            {formatTime(order.createdAt)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {formatPrice(order.paymentAmount)}
                        </span>
                        <span className="text-xs text-gray-400 line-through">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm text-gray-900">
                          {formatDate(order.pickupAt)}{' '}
                          {formatTime(order.pickupAt)}
                        </p>
                        {order.pickupNumber && (
                          <p className="text-xs text-gray-400">
                            픽업 번호 {order.pickupNumber}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="w-40 px-4 py-4">
                      <Tooltip content={description}>
                        <Badge variant="soft" color={badge.color}>
                          {badge.label}
                        </Badge>
                      </Tooltip>
                    </td>
                    <td className="px-4 py-4">
                      <ActionsMenu
                        items={buildOrderActionItems(
                          order,
                          onOrderAction,
                          onCancelRequest,
                          () => router.push(`/seller/orders/${order.id}`),
                          isActionPending
                        )}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-center border-t border-gray-200 px-4 py-4">
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
