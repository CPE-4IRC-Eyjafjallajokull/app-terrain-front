"use client";

import { useIncidents } from "@/hooks/useIncidents";
import { Header } from "@/components/header";
import { IncidentCard } from "@/components/incidents/incident-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  RefreshCw,
  AlertTriangle,
  Flame,
  Search,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function IncidentsPage() {
  const router = useRouter();
  const {
    filteredIncidents,
    incidents,
    isLoading,
    error,
    filters,
    setFilters,
    refetch,
  } = useIncidents();

  // Calculate stats
  const activeCount = incidents.filter((i) => !i.ended_at).length;
  const endedCount = incidents.filter((i) => i.ended_at).length;

  const handleIncidentClick = (incidentId: string) => {
    router.push(`/incidents/${incidentId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Hero Header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 to-red-500 p-8 text-white">
            <div className="absolute top-0 right-0 opacity-10">
              <Flame className="w-48 h-48 -mt-8 -mr-8" />
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Incidents
                  </h1>
                </div>
                <p className="text-white/80 max-w-md">
                  Suivez les interventions en cours et gérez les victimes
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={refetch}
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total des incidents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {isLoading ? "..." : incidents.length}
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-gradient-to-br from-card to-red-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  En cours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {isLoading ? "..." : activeCount}
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-gradient-to-br from-card to-green-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Terminés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {isLoading ? "..." : endedCount}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="border-primary/10">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search" className="sr-only">
                    Rechercher
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Rechercher par adresse, ville..."
                      value={filters.search}
                      onChange={(e) => setFilters({ search: e.target.value })}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showEnded"
                    checked={filters.showEnded}
                    onChange={(e) =>
                      setFilters({ showEnded: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="showEnded" className="text-sm">
                    Afficher les terminés
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error state */}
          {error && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="pt-6">
                <p className="text-destructive text-center">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="flex justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* Incidents List */}
          {!isLoading && !error && (
            <div className="space-y-4">
              {filteredIncidents.length === 0 ? (
                <Card className="border-primary/10">
                  <CardContent className="py-12 text-center">
                    <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Aucun incident trouvé.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredIncidents.map((incident) => (
                    <IncidentCard
                      key={incident.incident_id}
                      incident={incident}
                      onClick={() => handleIncidentClick(incident.incident_id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
