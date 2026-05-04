import { redirect } from 'next/navigation';

export default function SellerPage() {
  // TODO: API 연동 시 판매자 상태에 따른 분기 구현
  // const status = await getSellerStatus();
  // if (status === 'pending') redirect('/seller/pending');
  // if (status === 'approved') redirect('/seller/dashboard');

  redirect('/seller/register');
}
