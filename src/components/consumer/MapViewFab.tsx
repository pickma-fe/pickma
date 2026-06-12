'use client';

import { MapIcon } from 'lucide-react';
import Link from 'next/link';

export function MapViewFab() {
  return (
    <Link
      href="/map"
      className="bg-primary-500 hover:bg-primary-600 fixed right-6 bottom-24 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-colors"
      aria-label="지도 보기"
    >
      <MapIcon className="h-6 w-6 text-white" aria-hidden="true" />
    </Link>
  );
}
