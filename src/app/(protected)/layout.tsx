'use client';

import { UserMenu } from "@/components/auth/user-menu"
import { PageBackground, HometownImageBox } from "@/components/layout/page-background"
import Navigation from "@/components/Navigation"
import { MapPin } from 'lucide-react'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen relative">
      <PageBackground />
      <header className="border-b bg-card shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <MapPin className="h-6 w-6 text-primary" />
            <span>Eventig</span>
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
