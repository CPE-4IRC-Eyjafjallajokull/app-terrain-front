"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Flame, MapPin, Truck, Shield } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 space-y-2">
      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white/90">
        {icon}
      </div>
      <h3 className="font-semibold text-white text-sm">{title}</h3>
      <p className="text-xs text-white/60">{description}</p>
    </div>
  );
}

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: {
    [key: string]: { title: string; description: string };
  } = {
    AccessDenied: {
      title: "Accès refusé",
      description:
        "Vous n'avez pas la permission d'accéder à cette application.",
    },
    OAuthSignin: {
      title: "Erreur de connexion",
      description:
        "Erreur lors de la connexion au fournisseur d'authentification.",
    },
    OAuthCallback: {
      title: "Erreur de callback",
      description: "Erreur lors du callback d'authentification.",
    },
  };

  const errorInfo = errorMessages[error as string] || {
    title: "Erreur d'authentification",
    description:
      "Une erreur inattendue s'est produite lors de l'authentification.",
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding - Orange theme */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:24px_24px] opacity-30" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
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

          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold leading-tight mb-4">
                Interface
                <br />
                <span className="text-white/80">Pompiers Terrain</span>
              </h2>
              <p className="text-lg text-white/70 max-w-md">
                Application dédiée aux équipes d&apos;intervention sur le
                terrain. Accédez aux informations de votre véhicule et gérez vos
                interventions.
              </p>
            </div>

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

          <div className="flex items-center gap-4 text-sm text-white/50">
            <span>Service départemental-Métropolitain</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>Incendie et Secours</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>Lyon</span>
          </div>
        </div>

        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
      </div>

      {/* Right Side - Error Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
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

          {/* Error Card */}
          <Card className="border-red-200 dark:border-red-800 shadow-xl shadow-black/5">
            <CardHeader className="space-y-2">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl text-center text-red-600 dark:text-red-400">
                {errorInfo.title}
              </CardTitle>
              <CardDescription className="text-center">
                {errorInfo.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Code d&apos;erreur :{" "}
                <code className="bg-muted px-2 py-1 rounded text-xs">
                  {error || "unknown"}
                </code>
              </p>

              <div className="space-y-2">
                <Link href="/auth/signin" className="block">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    Réessayer
                  </Button>
                </Link>
                <Link href="/" className="block">
                  <Button variant="outline" className="w-full">
                    Retour à l&apos;accueil
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground px-4">
            Si le problème persiste, contactez votre administrateur.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={null}>
      <ErrorContent />
    </Suspense>
  );
}
