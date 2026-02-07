import { GoogleSignInButton } from "@/components/auth/google-signin-button"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            Events Gallery
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
            Sign in to access events gallery
          </p>
          <div className="space-y-4">
            <GoogleSignInButton />
          </div>
        </div>
      </div>
    </div>
  )
}
