"use client"

import { useSession, signIn, signOut } from "next-auth/react"

export function UserMenu() {
  const { data: session, status } = useSession()

  if (status === "loading") return null

  if (!session?.user) {
    return (
      <button
        onClick={() => signIn("google")}
        className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
      >
        Anmelden
      </button>
    )
  }

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
        Abmelden
      </button>
    </div>
  )
}
