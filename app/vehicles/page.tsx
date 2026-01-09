"use client";

import { useVehicles } from "@/hooks/useVehicles";
import { Header } from "@/components/header";
import { VehicleFiltersBar } from "@/components/vehicles/vehicle-filters";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { VehicleDetail } from "@/components/vehicles/vehicle-detail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import {
  RefreshCw,
  Truck,
  Flame,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

function VehiclesPageContent() {
  const searchParams = useSearchParams();
  const {
    filteredVehicles,
    vehicles,
    vehicleTypes,
    vehicleStatuses,
    stations,
    isLoading,
    error,
    filters,
    selectedVehicle,
    setFilters,
    resetFilters,
    selectVehicle,
    refetch,
  } = useVehicles();

  // Auto-select vehicle from URL parameter
  useEffect(() => {
    const selectedImmat = searchParams.get("selected");
    if (selectedImmat && vehicles.length > 0 && !selectedVehicle) {
      const vehicle = vehicles.find((v) => v.immatriculation === selectedImmat);
      if (vehicle) {
        selectVehicle(vehicle);
      }
    }
  }, [searchParams, vehicles, selectedVehicle, selectVehicle]);

  // Calculate stats - Exclure les véhicules indisponibles
  const availableCount = vehicles.filter((v) => {
    const statusLabel = v.status?.label?.toLowerCase();
    return (
      statusLabel &&
      statusLabel.includes("disponible") &&
      !statusLabel.includes("indisponible")
    );
  }).length;
  const busyCount = vehicles.filter((v) =>
    v.status?.label?.toLowerCase().includes("intervention"),
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Hero Header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-8 text-primary-foreground">
            <div className="absolute top-0 right-0 opacity-10">
              <Flame className="w-48 h-48 -mt-8 -mr-8" />
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Truck className="w-8 h-8" />
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Véhicules
                  </h1>
                </div>
                <p className="text-primary-foreground/80 max-w-md">
                  Gérez et consultez l&apos;ensemble des véhicules de la flotte
                  SDMIS
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total des véhicules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {isLoading ? "..." : vehicles.length}
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-gradient-to-br from-card to-green-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Disponibles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {isLoading ? "..." : availableCount}
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-gradient-to-br from-card to-red-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  En intervention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {isLoading ? "..." : busyCount}
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Types de véhicules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {isLoading ? "..." : vehicleTypes.length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Filters + Vehicle list */}
            <div className="lg:col-span-2 space-y-4">
              {/* Filters */}
              <Card className="border-primary/20">
                <CardContent className="p-4">
                  <VehicleFiltersBar
                    filters={filters}
                    onFiltersChange={setFilters}
                    onReset={resetFilters}
                    vehicleTypes={vehicleTypes}
                    vehicleStatuses={vehicleStatuses}
                    stations={stations}
                    totalCount={vehicles.length}
                    filteredCount={filteredVehicles.length}
                  />
                </CardContent>
              </Card>

              {/* Vehicle list */}
              <Card className="border-primary/20 shadow-lg">
                <CardHeader className="border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Truck className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle>Liste des véhicules</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {error ? (
                    <div className="text-center py-12 text-destructive">
                      <Flame className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium">Erreur: {error}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={refetch}
                        className="mt-4"
                      >
                        Réessayer
                      </Button>
                    </div>
                  ) : isLoading ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <RefreshCw className="w-10 h-10 animate-spin mx-auto mb-4 text-primary" />
                      <p>Chargement des véhicules...</p>
                    </div>
                  ) : filteredVehicles.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Truck className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg">Aucun véhicule trouvé</p>
                      <p className="text-sm">Essayez de modifier vos filtres</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[600px]">
                      <div className="p-4 space-y-3">
                        {filteredVehicles.map((vehicle) => (
                          <VehicleCard
                            key={vehicle.vehicle_id}
                            vehicle={vehicle}
                            onClick={() => selectVehicle(vehicle)}
                            isSelected={
                              selectedVehicle?.vehicle_id === vehicle.vehicle_id
                            }
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right: Vehicle detail */}
            <div className="lg:col-span-1">
              {selectedVehicle ? (
                <div className="sticky top-24">
                  <VehicleDetail
                    vehicle={selectedVehicle}
                    onClose={() => selectVehicle(null)}
                    vehicleStatuses={vehicleStatuses}
                    onVehicleUpdate={() => {
                      // Ne pas utiliser le véhicule incomplet retourné par l'API
                      // Juste refetch pour obtenir les données complètes
                      refetch();
                    }}
                  />
                </div>
              ) : (
                <Card className="border-primary/20 border-dashed">
                  <CardContent className="py-16 text-center text-muted-foreground">
                    <Truck className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="font-medium">Aucun véhicule sélectionné</p>
                    <p className="text-sm mt-1">
                      Cliquez sur un véhicule pour voir ses détails
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function VehiclesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <VehiclesPageContent />
    </Suspense>
  );
}
