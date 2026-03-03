'use client';

import Image from 'next/image';

interface PageBackgroundProps {
  hometown?: string;
}

export function PageBackground({ hometown = 'monheim' }: PageBackgroundProps) {
  return (
    <div className="fixed inset-0 -z-10 h-screen w-screen overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1580674684081-7617fbf3d745?q=80&w=2940&auto=format&fit=crop"
        alt={`${hometown} cityscape`}
        fill
        priority
        className="object-cover"
        quality={85}
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-background/90 dark:bg-background/95 backdrop-blur-sm" />
    </div>
  );
}
