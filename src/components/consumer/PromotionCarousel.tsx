'use client';

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type PromotionBanner = {
  id: number;
  imageUrl: string;
  ctaLabel?: string;
  ctaHref?: string;
};

const slideTranslateClasses = [
  'translate-x-0',
  '-translate-x-full',
  '-translate-x-[200%]',
  '-translate-x-[300%]',
  '-translate-x-[400%]',
];

const promotionBanners: PromotionBanner[] = [
  {
    id: 1,
    imageUrl: '/images/banners/pickma-banner2.png',
    ctaLabel: '픽마 서비스 소개',
    ctaHref: '/',
  },
  {
    id: 2,
    imageUrl: '/images/banners/pickma-banner-use.png',
  },
];

if (promotionBanners.length > slideTranslateClasses.length) {
  throw new Error(
    'slideTranslateClasses length must cover all promotionBanners.'
  );
}

export function PromotionCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? promotionBanners.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === promotionBanners.length - 1 ? 0 : prevIndex + 1
    );
  };

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === promotionBanners.length - 1 ? 0 : prevIndex + 1
      );
    }, 10000);

    return () => window.clearInterval(timerId);
  }, []);

  return (
    <section className="relative mb-8 h-80 overflow-hidden rounded-lg bg-[#f5fbf8]">
      <div
        className={[
          'flex h-full transition-transform duration-700 ease-in-out',
          slideTranslateClasses[currentIndex],
        ].join(' ')}
      >
        {promotionBanners.map((banner) => (
          <div key={banner.id} className="relative h-full w-full shrink-0">
            <Image
              src={banner.imageUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) calc(100vw - 220px), 100vw"
              className="object-contain"
              priority={banner.id === 1}
            />

            {banner.ctaLabel && banner.ctaHref && (
              <Link
                href={banner.ctaHref}
                className="bg-primary-500 hover:bg-primary-600 absolute bottom-[20%] left-[20%] inline-flex items-center justify-center rounded-sm border border-transparent px-4 py-2 font-medium text-white transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                {banner.ctaLabel}
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="absolute right-4 bottom-2 flex items-center gap-3 text-sm font-medium text-gray-700">
        <button
          type="button"
          aria-label="이전 배너"
          onClick={handlePrevious}
          className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 hover:bg-white/70"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>

        <span>
          {currentIndex + 1} / {promotionBanners.length}
        </span>

        <button
          type="button"
          aria-label="다음 배너"
          onClick={handleNext}
          className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 hover:bg-white/70"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
