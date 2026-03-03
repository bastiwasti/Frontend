'use client';

import Image from 'next/image';

interface PageBackgroundProps {
  hometown?: string;
}

const CITY_IMAGES: Record<string, string> = {
  monheim: '/images/monheim-innenstadt.jpg',
  default: '/images/monheim-innenstadt.jpg',
};

export function PageBackground({ hometown = 'monheim' }: PageBackgroundProps) {
  const imageUrl = CITY_IMAGES[hometown] || CITY_IMAGES.default;  
  return (
    <div className="fixed inset-0 -z-10 h-screen w-screen overflow-hidden bg-black">
      <Image
        src={imageUrl}
        alt={`${hometown} cityscape`}
        fill
        priority
        className="object-cover"
        quality={95}
        sizes="100vw"
        unoptimized
      />
      <div className="absolute inset-0 bg-black/10" />
    </div>
  );
}
