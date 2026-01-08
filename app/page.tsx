"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Truck,
  Flame,
  AlertTriangle,
  Activity,
  RefreshCw,
  Siren,
} from "lucide-react";

type DashboardStats = {
  vehiclesOnIntervention: number;
  totalVehicles: number;
  activeIncidents: number;
  totalIncidents: number;
  totalCasualties: number;
  fireStationsCount: number;
};

export default function Home() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!session?.accessToken) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [vehiclesRes, incidentsRes, fireStationsRes] = await Promise.all([
        fetch("/api/vehicles"),
        fetch("/api/incidents"),
        fetch("/api/interest-points/by-kind/fire_station"),
      ]);

      const vehicles = vehiclesRes.ok ? await vehiclesRes.json() : [];
      const incidents = incidentsRes.ok ? await incidentsRes.json() : [];
      const fireStations = fireStationsRes.ok
        ? await fireStationsRes.json()
        : [];

      // Calculate stats
      const vehiclesOnIntervention = vehicles.filter(
        (v: { status?: { code?: string } }) =>
          v.status?.code === "INTERVENTION" ||
          v.status?.code === "EN_ROUTE" ||
          v.status?.code === "SUR_PLACE",
      ).length;

      const activeIncidents = incidents.filter(
        (i: { ended_at?: string | null }) => !i.ended_at,
      ).length;

      // For casualties, we'd need to fetch each incident's casualties
      // For now, we'll show active incidents count as proxy
      setStats({
        vehiclesOnIntervention,
        totalVehicles: vehicles.length,
        activeIncidents,
        totalIncidents: incidents.length,
        totalCasualties: 0, // Would require additional API calls
        fireStationsCount: fireStations.length,
      });
    } catch (err) {
      setError("Erreur lors du chargement des statistiques");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    href,
    color,
    badge,
  }: {
    title: string;
    value: number | string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    color: string;
    badge?: string;
  }) => (
    <Link href={href} className="block">
      <Card className="hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer border-primary/10 group">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <div className="flex items-baseline gap-2">
                {isLoading ? (
                  <Skeleton className="h-9 w-16" />
                ) : (
                  <span className={`text-3xl font-bold ${color}`}>{value}</span>
                )}
                {badge && (
                  <Badge variant="secondary" className="text-xs">
                    {badge}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
            <div
              className={`p-3 rounded-xl ${color.replace("text-", "bg-")}/10 group-hover:${color.replace("text-", "bg-")}/20 transition-colors`}
            >
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-8 text-primary-foreground">
            <div className="absolute top-0 right-0 opacity-10">
              <Flame className="w-48 h-48 -mt-8 -mr-8" />
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                  Tableau de bord
                </h1>
                <p className="text-primary-foreground/80 max-w-xl">
                  Vue d&apos;ensemble des opérations en cours sur le territoire
                  SDMIS
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={fetchStats}
                disabled={isLoading}
                className="shadow-lg"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Actualiser
              </Button>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="p-4 flex items-center gap-3 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                <span>{error}</span>
              </CardContent>
            </Card>
          )}

          {/* Stats Widgets Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Véhicules en intervention"
              value={stats?.vehiclesOnIntervention ?? "-"}
              subtitle={`sur ${stats?.totalVehicles ?? "..."} véhicules`}
              icon={Siren}
              href="/vehicles"
              color="text-red-600"
              badge="En temps réel"
            />
            <StatCard
              title="Incidents en cours"
              value={stats?.activeIncidents ?? "-"}
              subtitle={`${stats?.totalIncidents ?? "..."} incidents au total`}
              icon={AlertTriangle}
              href="/incidents"
              color="text-orange-600"
            />
            <StatCard
              title="Centres de secours"
              value={stats?.fireStationsCount ?? "-"}
              subtitle="Points d'intérêt actifs"
              icon={Building2}
              href="/fire-stations"
              color="text-blue-600"
            />
            <StatCard
              title="Flotte totale"
              value={stats?.totalVehicles ?? "-"}
              subtitle="Véhicules enregistrés"
              icon={Truck}
              href="/vehicles"
              color="text-green-600"
            />
          </div>

          {/* Quick Access Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Incidents Card */}
            <Card className="hover:shadow-lg transition-shadow border-primary/10 group">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-orange-100 dark:bg-orange-900/30 rounded-xl group-hover:scale-110 transition-transform">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Incidents</CardTitle>
                    <CardDescription>Gestion des interventions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Suivez les incidents en cours, déclarez les victimes et gérez
                  les engagements véhicules.
                </p>
                <Link href="/incidents">
                  <Button className="w-full group-hover:bg-primary/90">
                    Voir les incidents
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Fire Stations Card */}
            <Card className="hover:shadow-lg transition-shadow border-primary/10 group">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:scale-110 transition-transform">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      Centres de Secours
                    </CardTitle>
                    <CardDescription>
                      Casernes et points d&apos;intérêt
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Consultez la liste des centres de secours et leurs
                  localisations sur le territoire.
                </p>
                <Link href="/fire-stations">
                  <Button className="w-full group-hover:bg-primary/90">
                    Voir les centres
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Vehicles Card */}
            <Card className="hover:shadow-lg transition-shadow border-primary/10 group">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded-xl group-hover:scale-110 transition-transform">
                    <Truck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Véhicules</CardTitle>
                    <CardDescription>Suivi en temps réel</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Suivez l&apos;état et la position des véhicules, filtrez par
                  type ou statut.
                </p>
                <Link href="/vehicles">
                  <Button className="w-full group-hover:bg-primary/90">
                    Voir les véhicules
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Activity Indicator */}
          <Card className="border-primary/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Activity className="w-5 h-5 text-green-600" />
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Système opérationnel</p>
                    <p className="text-xs text-muted-foreground">
                      Données synchronisées avec l&apos;API SDMIS
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-200"
                >
                  En ligne
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
