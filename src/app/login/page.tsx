import { GoogleSignInButton } from "@/components/auth/google-signin-button"
import { Footer } from "@/components/layout/footer"
import { MapPin } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-card rounded-2xl border shadow-2xl p-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <MapPin className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">
                Eventig
              </h1>
            </div>
            <p className="text-muted-foreground text-center mb-8">
              Mit Google anmelden, um Events in deinen Kalender zu speichern und zu bewerten
            </p>
            <div className="space-y-4">
              <GoogleSignInButton />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
