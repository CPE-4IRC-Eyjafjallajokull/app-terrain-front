"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Flame,
  MapPin,
  Truck,
  Shield,
  Loader2,
} from "lucide-react";
import { useState } from "react";

import { FeatureCard } from "@/components/auth/feature-card";

export default function SignInShell() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    await signIn("keycloak", {
      redirect: true,
      callbackUrl: "/",
    });
  };

  const errorMessages: Record<string, { title: string; description: string }> =
    {
      AccessDenied: {
        title: "Accès refusé",
        description:
          "Vous n'avez pas la permission d'accéder à cette application. Contactez votre administrateur.",
      },
      OAuthSignin: {
        title: "Erreur d'authentification",
        description:
          "Une erreur s'est produite lors de la connexion. Veuillez réessayer.",
      },
      OAuthCallback: {
        title: "Erreur de callback",
        description:
          "Le callback d'authentification a échoué. Veuillez vous reconnecter.",
      },
      Default: {
        title: "Erreur",
        description: "Une erreur inattendue s'est produite. Veuillez réessayer plus tard.",
      },
    };

  const currentError = error
    ? errorMessages[error] || errorMessages.Default
    : null;

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding (Orange theme for Terrain) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=')] opacity-30" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <Flame className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">SDMIS</h1>
                <p className="text-sm text-white/70">Application Terrain</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold leading-tight mb-4">
                Équipes Terrain
                <br />
                <span className="text-white/80">Interventions</span>
              </h2>
              <p className="text-lg text-white/70 max-w-md">
                Application mobile pour les équipes d&apos;intervention sur le
                terrain. Suivi en temps réel et demande de renforts.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-3 gap-4">
              <FeatureCard
                icon={<MapPin className="w-5 h-5" />}
                title="Navigation"
                description="GPS vers incidents"
              />
              <FeatureCard
                icon={<Truck className="w-5 h-5" />}
                title="Véhicules"
                description="État de la flotte"
              />
              <FeatureCard
                icon={<Shield className="w-5 h-5" />}
                title="Renforts"
                description="Demande de soutien"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 text-sm text-white/50">
            <span>Service départemental-Métropolitain</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>Incendie et Secours</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>Lyon</span>
          </div>
        </div>

        {/* Decorative blurs */}
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center">
                <Flame className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-foreground">SDMIS</h1>
                <p className="text-xs text-muted-foreground">
                  Application Terrain
                </p>
              </div>
            </div>
          </div>

          {/* Login Card */}
          <Card className="border-0 shadow-xl shadow-black/5">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-semibold tracking-tight">
                Connexion
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Authentifiez-vous pour accéder à l&apos;application terrain
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {currentError && (
                <div className="flex gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-destructive text-sm">
                      {currentError.title}
                    </p>
                    <p className="text-sm text-destructive/80">
                      {currentError.description}
                    </p>
                  </div>
                </div>
              )}

              <Button
                onClick={handleSignIn}
                className="w-full h-12 text-base font-medium bg-orange-600 hover:bg-orange-700"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <Flame className="w-5 h-5" />
                    Se connecter avec Keycloak
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground px-4">
            Accès réservé aux équipes d&apos;intervention du SDMIS.
            <br />
            Toute tentative d&apos;accès non autorisé est enregistrée.
          </p>
        </div>
      </div>
    </div>
  );
}
