'use client';

import { UserMenu } from "@/components/auth/user-menu"
import { PageBackground } from "@/components/layout/page-background"
import Navigation from "@/components/Navigation"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen relative">
      <PageBackground />
      <header className="border-b bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              📍 Events Gallery
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Navigation />
            <UserMenu />
          </div>
        </div>
      </header>
      <main className="relative z-10">
        {children}
      </main>
    </div>
  )
}
