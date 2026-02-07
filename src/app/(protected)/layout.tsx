import { UserMenu } from "@/components/auth/user-menu"
import { Filter } from "lucide-react"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Events Gallery</h1>
          </div>
          <UserMenu />
        </div>
      </header>
      {children}
    </div>
  )
}
