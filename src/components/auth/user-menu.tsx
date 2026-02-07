"use client"

import { useSession, signOut } from "next-auth/react"

export function UserMenu() {
  const { data: session } = useSession()

  if (!session?.user) return null

  return (
    <div className="flex items-center gap-3">
      {session.user.image && (
        <img
          src={session.user.image}
          alt={session.user.name ?? ""}
          className="w-8 h-8 rounded-full border border-gray-200"
        />
      )}
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {session.user.name}
      </span>
      <button
        onClick={() => signOut()}
        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
      >
        Sign out
      </button>
    </div>
  )
}
