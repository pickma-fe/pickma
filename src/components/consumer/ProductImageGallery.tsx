import Image from 'next/image';

interface ProductImageGalleryProps {
  productName: string;
  imageUrl?: string;
}

const FALLBACK_IMAGE_URL = '/images/fallback/noimage.png';

export function ProductImageGallery({
  productName,
  imageUrl,
}: ProductImageGalleryProps) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
      <Image
        src={imageUrl || FALLBACK_IMAGE_URL}
        alt={productName}
        fill
        sizes="(min-width: 1280px) 520px, (min-width: 1024px) 60vw, 100vw"
        className="object-cover"
        preload
      />
    </div>
  );
}
