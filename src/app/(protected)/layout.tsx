'use client';

import { UserMenu } from "@/components/auth/user-menu"
import { PageBackground, HometownImageBox } from "@/components/layout/page-background"
import { Footer } from "@/components/layout/footer"
import Navigation from "@/components/Navigation"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen relative flex flex-col">
      <PageBackground />
      <header className="border-b bg-card shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-2xl font-bold text-foreground">
              <img src="/logo-mark.svg" alt="" className="h-8 w-8" />
              <span>Eventig</span>
            </div>
            <span className="hidden sm:inline text-sm text-muted-foreground">Events für Familien</span>
          </div>
          <div className="flex items-center gap-4">
            <Navigation />
            <UserMenu />
          </div>
        </div>
      </header>
      <main className="relative z-10 flex-1 pb-16 md:pb-0">
        {children}
      </main>
      <Footer />
    </div>
  )
}
