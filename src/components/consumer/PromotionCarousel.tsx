'use client';

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { Button } from '@/components/common';

type PromotionBanner = {
  id: number;
  imageUrl: string;
  ctaLabel?: string;
};

const promotionBanners: PromotionBanner[] = [
  {
    id: 1,
    imageUrl: '/images/banners/pickma-banner2.png',
    ctaLabel: '픽마 서비스 소개',
  },
  {
    id: 2,
    imageUrl: '/images/banners/pickma-banner-use.png',
  },
];

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
    }, 5000);

    return () => window.clearInterval(timerId);
  }, []);

  return (
    <section className="relative mb-8 h-80 overflow-hidden rounded-lg bg-[#f5fbf8]">
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
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

            {banner.ctaLabel && (
              <Button className="absolute bottom-[20%] left-[20%]">
                {banner.ctaLabel}
              </Button>
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
