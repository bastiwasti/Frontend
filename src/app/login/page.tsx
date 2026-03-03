import { GoogleSignInButton } from "@/components/auth/google-signin-button"
import { MapPin } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-4">
        <div className="bg-card/85 rounded-2xl border border-white/10 shadow-2xl p-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <MapPin className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              Eventig
            </h1>
          </div>
          <p className="text-muted-foreground text-center mb-8">
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
