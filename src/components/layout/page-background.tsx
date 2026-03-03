'use client';

import Image from 'next/image';

interface PageBackgroundProps {
  hometown?: string;
}

const CITY_IMAGES: Record<string, string> = {
  monheim: 'https://www.monheim.de/fileadmin/user_upload/Media/Bilder_NEU/00_Headerbilder/Header-Olympia_1.jpg',
  default: 'https://www.monheim.de/fileadmin/user_upload/Media/Bilder_NEU/00_Headerbilder/Header-Olympia_3.jpg',
};

export function PageBackground({ hometown = 'monheim' }: PageBackgroundProps) {
  const imageUrl = CITY_IMAGES[hometown] || CITY_IMAGES.default;
  
  return (
    <div className="fixed inset-0 -z-10 h-screen w-screen overflow-hidden">
      <Image
        src={imageUrl}
        alt={`${hometown} cityscape`}
        fill
        priority
        className="object-cover"
        quality={85}
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-background/85 dark:bg-background/90 backdrop-blur-sm" />
    </div>
  );
}
