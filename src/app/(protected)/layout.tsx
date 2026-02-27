'use client';

import { UserMenu } from "@/components/auth/user-menu"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-end">
          <UserMenu />
        </div>
      </header>
      {children}
    </div>
  )
}
