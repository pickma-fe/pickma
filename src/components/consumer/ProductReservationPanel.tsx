import { Button } from '@/components/common';

interface ProductReservationPanelProps {
  price: number;
}

export function ProductReservationPanel({
  price,
}: ProductReservationPanelProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-bold text-gray-900">
        픽업 날짜 및 시간 선택
      </h2>

      <div className="mb-6 rounded-md border border-gray-200 p-4 text-sm text-gray-600">
        시간 선택 영역
      </div>

      <div className="mb-6">
        <p className="mb-3 text-sm font-semibold text-gray-900">수량 선택</p>
        <div className="flex w-fit items-center rounded-md border border-gray-200">
          <button type="button" className="px-4 py-2 text-gray-600">
            -
          </button>
          <span className="px-4 py-2 text-sm font-medium">1</span>
          <button type="button" className="px-4 py-2 text-gray-600">
            +
          </button>
        </div>
      </div>

      <Button className="w-full py-3 text-sm font-bold">
        {price.toLocaleString()}원 담기
      </Button>
    </div>
  );
}
