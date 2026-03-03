import { GoogleSignInButton } from "@/components/auth/google-signin-button"
import { PageBackground } from "@/components/layout/page-background"

export default function LoginPage() {
  return (
    <div className="min-h-screen relative">
      <PageBackground />
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-card/90 backdrop-blur-lg rounded-xl border shadow-lg p-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 text-center">
              Events Gallery
            </h1>
            <p className="text-muted-foreground text-center mb-8">
              Sign in to access events gallery
            </p>
            <div className="space-y-4">
              <GoogleSignInButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
