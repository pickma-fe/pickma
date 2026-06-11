import Image from 'next/image';

import Logo from '../Logo/Logo';

export function BrandSection() {
  return (
    <section aria-label="브랜드 정보" className="flex flex-col">
      <Logo size="md" />

      <p className="mt-6 text-xs text-gray-600">
        동네 맛집부터 취향저격 상품까지, <br />
        픽마에서 간편하게 픽업하세요.
      </p>

      {/* TODO: 실제 Store 링크 확정 시 각 Image를 <a href="..." target="_blank" rel="noopener noreferrer">로 감싸고 opacity-50 제거 */}
      <div className="mt-12 flex flex-col items-start gap-2 opacity-50 sm:flex-row sm:items-center">
        <Image
          src="/images/badges/google.svg"
          alt="Google Play (준비중)"
          height={40}
          width={0}
          className="h-10 w-auto"
        />
        <Image
          src="/images/badges/apple.svg"
          alt="App Store (준비중)"
          height={40}
          width={0}
          className="h-10 w-auto"
        />
      </div>
    </section>
  );
}
