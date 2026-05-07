'use client';

import Link from 'next/link';

import { useAuthModal } from '@/components/auth/useAuthModal';
import { Button } from '@/components/common/Button/Button';

export default function SellerPage() {
  const { openAuthModal } = useAuthModal();

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20">
      <h1 className="text-2xl font-bold text-gray-900">판매자 센터</h1>
      <p className="text-sm text-gray-400">
        ※ 임시 페이지입니다. 추후 랜딩 페이지로 교체 예정입니다.
      </p>
      <div className="flex flex-col gap-3">
        <Button className="w-full" onClick={() => openAuthModal('login')}>
          로그인
        </Button>
        <Link href="/seller/register">
          <Button variant="outline" color="gray" className="w-full">
            판매자 등록
          </Button>
        </Link>
      </div>
    </div>
  );
}
