"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { VehicleSearch } from "@/components/terrain/vehicle-search";
import { TerrainDashboard } from "@/components/terrain/terrain-dashboard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Flame,
  Shield,
  Radio,
  MapPin,
  Truck,
  LogIn,
  LogOut,
} from "lucide-react";
import type { Vehicle } from "@/lib/vehicles/types";
import Link from "next/link";
import { signOut } from "next-auth/react";

// Feature card component for the signin side
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

// Helper function to get stored vehicle from localStorage
function getStoredVehicle(): Vehicle | null {
  if (typeof window === "undefined") return null;
  const storedVehicle = localStorage.getItem("terrain_selected_vehicle");
  if (storedVehicle) {
    try {
      return JSON.parse(storedVehicle);
    } catch {
      localStorage.removeItem("terrain_selected_vehicle");
    }
  }
  return null;
}

export default function Home() {
  const { data: session, status } = useSession();
  // Use lazy initialization to avoid setState in useEffect
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(() => {
    // Only run on client side and when we might be authenticated
    if (typeof window !== "undefined") {
      return getStoredVehicle();
    }
    return null;
  });

  // Handle vehicle selection
  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    localStorage.setItem("terrain_selected_vehicle", JSON.stringify(vehicle));
  };

  // Handle back to search
  const handleBack = () => {
    setSelectedVehicle(null);
    localStorage.removeItem("terrain_selected_vehicle");
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 text-center">
          <Skeleton className="w-16 h-16 rounded-xl mx-auto" />
          <Skeleton className="w-48 h-6 mx-auto" />
          <Skeleton className="w-32 h-4 mx-auto" />
        </div>
      </div>
    );
  }

  // If vehicle is selected, show dashboard
  if (session && selectedVehicle) {
    return <TerrainDashboard vehicle={selectedVehicle} onBack={handleBack} />;
  }

  // If authenticated but no vehicle selected, show search
  if (session) {
    return (
      <div className="min-h-screen flex">
        {/* Left Side - Branding - Orange theme for terrain */}
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
                  Accédez aux informations de votre véhicule et de
                  l&apos;intervention en cours. Gérez les victimes et demandez
                  des renforts.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FeatureCard
                  icon={<Truck className="w-5 h-5" />}
                  title="Mon véhicule"
                  description="Statut et position en temps réel"
                />
                <FeatureCard
                  icon={<MapPin className="w-5 h-5" />}
                  title="Navigation"
                  description="Itinéraire vers l'incident"
                />
                <FeatureCard
                  icon={<Shield className="w-5 h-5" />}
                  title="Renforts"
                  description="Demande rapide"
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

        {/* Right Side - Vehicle Search */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-background">
          <div className="w-full max-w-md space-y-8">
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                  <Flame className="w-7 h-7 text-primary-foreground" />
                </div>
                <div className="text-left">
                  <h1 className="text-xl font-bold text-foreground">SDMIS</h1>
                  <p className="text-xs text-muted-foreground">
                    Application Terrain
                  </p>
                </div>
              </div>
            </div>

            {/* Welcome message */}
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-semibold">
                  Bonjour, {session.user?.name?.split(" ")[0] || "Pompier"} 👋
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="gap-2 text-muted-foreground hover:text-destructive hover:border-destructive"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </Button>
              </div>
              <p className="text-muted-foreground">
                Recherchez votre véhicule pour accéder à votre intervention
              </p>
            </div>

            {/* Vehicle Search */}
            <VehicleSearch onVehicleSelect={handleVehicleSelect} />

            <p className="text-center text-xs text-muted-foreground px-4">
              Entrez l&apos;immatriculation du véhicule auquel vous êtes affecté
              pour accéder aux informations de l&apos;intervention.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated - Show signin prompt
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
                icon={<Radio className="w-5 h-5" />}
                title="Temps réel"
                description="Suivi live de l'intervention"
              />
              <FeatureCard
                icon={<MapPin className="w-5 h-5" />}
                title="Navigation"
                description="Itinéraire GPS intégré"
              />
              <FeatureCard
                icon={<Truck className="w-5 h-5" />}
                title="Véhicule"
                description="Gestion du statut"
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

      {/* Right Side - Sign In Prompt */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <Flame className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-foreground">SDMIS</h1>
                <p className="text-xs text-muted-foreground">
                  Application Terrain
                </p>
              </div>
            </div>
          </div>

          {/* Sign in card */}
          <div className="bg-card border border-orange-200 rounded-xl p-8 shadow-xl shadow-black/5 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
                <Shield className="w-8 h-8 text-orange-600" />
              </div>
              <h2 className="text-2xl font-semibold">Connexion requise</h2>
              <p className="text-muted-foreground">
                Authentifiez-vous pour accéder à l&apos;application terrain
              </p>
            </div>

            <Link href="/auth/signin">
              <Button
                className="w-full h-12 text-base gap-2 bg-orange-600 hover:bg-orange-700"
                size="lg"
              >
                <LogIn className="w-5 h-5" />
                Se connecter
              </Button>
            </Link>
          </div>

          <p className="text-center text-xs text-muted-foreground px-4">
            Accès réservé aux personnels habilités du SDMIS.
            <br />
            Toute tentative d&apos;accès non autorisé est enregistrée.
          </p>
        </div>
      </div>
    </div>
  );
}
