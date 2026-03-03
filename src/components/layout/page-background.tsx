'use client';

interface PageBackgroundProps {
  children?: React.ReactNode;
}

export function PageBackground({ children }: PageBackgroundProps) {
  return (
    <div className="fixed inset-0 -z-10 h-screen w-screen overflow-hidden bg-gradient-to-br from-background via-background to-background/80">
      {children}
    </div>
  );
}

export function HometownImageBox({ hometown = 'monheim' }: { hometown?: string }) {
  return (
    <div className="relative h-48 w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
      <img
        src="/images/monheim-innenstadt.jpg"
        alt="Monheim cityscape"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
    </div>
  );
}
