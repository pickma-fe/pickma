'use client';

import { MapIcon } from 'lucide-react';
import Link from 'next/link';

export function MapViewFab() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40">
      <div className="mx-auto max-w-360 px-4 pb-6 sm:px-6 lg:px-12">
        <div className="flex justify-end">
          <Link
            href="/map"
            className="bg-primary-500 hover:bg-primary-600 pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-colors"
            aria-label="지도 보기"
          >
            <MapIcon className="h-6 w-6 text-white" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
