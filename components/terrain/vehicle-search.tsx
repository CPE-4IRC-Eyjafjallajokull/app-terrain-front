"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Truck,
  Loader2,
  AlertCircle,
  CheckCircle,
  MapPin,
} from "lucide-react";
import type { Vehicle } from "@/lib/vehicles/types";
import { getVehicleImagePath } from "@/lib/vehicles/images";

type VehicleSearchProps = {
  onVehicleSelect: (vehicle: Vehicle) => void;
  isLoading?: boolean;
};

export function VehicleSearch({
  onVehicleSelect,
  isLoading: externalLoading,
}: VehicleSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Fetch all vehicles on mount
  useEffect(() => {
    const fetchVehicles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/vehicles");
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des véhicules");
        }
        const data = await response.json();
        const vehiclesList = data?.vehicles || [];
        setVehicles(vehiclesList);
      } catch (err) {
        console.error("Erreur:", err);
        setError("Impossible de charger les véhicules");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  // Filter vehicles based on search query
  useEffect(() => {
    if (searchQuery.length >= 1) {
      const query = searchQuery.toUpperCase();
      const filtered = vehicles.filter((v) =>
        v.immatriculation.toUpperCase().includes(query),
      );
      setFilteredVehicles(filtered);
      setShowResults(true);
    } else {
      setFilteredVehicles([]);
      setShowResults(false);
    }
  }, [searchQuery, vehicles]);

  const handleSelectVehicle = useCallback(
    (vehicle: Vehicle) => {
      setSearchQuery(vehicle.immatriculation);
      setShowResults(false);
      onVehicleSelect(vehicle);
    },
    [onVehicleSelect],
  );

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (filteredVehicles.length === 1) {
        handleSelectVehicle(filteredVehicles[0]);
      } else if (filteredVehicles.length > 1) {
        // Show results if multiple matches
        setShowResults(true);
      }
    },
    [filteredVehicles, handleSelectVehicle],
  );

  const getStatusBadge = (status: { label?: string } | null) => {
    const label = status?.label?.toLowerCase() || "";

    if (label.includes("disponible") && !label.includes("indisponible")) {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
          <CheckCircle className="w-3 h-3 mr-1" />
          Disponible
        </Badge>
      );
    }
    if (label.includes("engagé") || label.includes("intervention")) {
      return (
        <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
          <AlertCircle className="w-3 h-3 mr-1" />
          En intervention
        </Badge>
      );
    }
    if (label.includes("hors service") || label.includes("indisponible")) {
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
          <AlertCircle className="w-3 h-3 mr-1" />
          Indisponible
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-xs">
        {status?.label || "Inconnu"}
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-md border-orange-200 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-100 rounded-lg">
            <Truck className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <CardTitle className="text-xl">Recherche véhicule</CardTitle>
            <CardDescription>
              Entrez l&apos;immatriculation de votre véhicule
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Ex: AB-123-CD"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
              className="pl-10 h-12 text-lg font-mono uppercase"
              disabled={isLoading || externalLoading}
              autoFocus
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg text-destructive text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {showResults && filteredVehicles.length > 0 && (
            <div className="rounded-lg border bg-background shadow-lg">
              <ScrollArea className="h-[240px]">
                <div className="p-2 space-y-1">
                  {filteredVehicles.slice(0, 50).map((vehicle) => (
                    <button
                      key={vehicle.vehicle_id}
                      type="button"
                      onClick={() => handleSelectVehicle(vehicle)}
                      className="w-full p-3 rounded-lg hover:bg-accent transition-colors text-left flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-orange-100 rounded flex items-center justify-center w-9 h-9">
                          <Image
                            src={getVehicleImagePath(
                              vehicle.vehicle_type?.code,
                            )}
                            alt={vehicle.vehicle_type?.code || "Véhicule"}
                            width={24}
                            height={24}
                            className="object-contain"
                            onError={(e) => {
                              // Fallback to default image if not found
                              (e.target as HTMLImageElement).src =
                                "/vehicles/vehicle_VTU.png";
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-mono font-semibold">
                            {vehicle.immatriculation}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {vehicle.vehicle_type?.label || "Type inconnu"}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(vehicle.status)}
                    </button>
                  ))}
                  {filteredVehicles.length > 50 && (
                    <p className="text-xs text-center text-muted-foreground py-2">
                      +{filteredVehicles.length - 50} autres véhicules. Affinez
                      votre recherche.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          {showResults &&
            searchQuery.length >= 1 &&
            filteredVehicles.length === 0 && (
              <div className="p-4 text-center text-muted-foreground border rounded-lg border-dashed">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucun véhicule trouvé</p>
                <p className="text-xs mt-1">
                  Vérifiez l&apos;immatriculation saisie
                </p>
              </div>
            )}

          <Button
            type="submit"
            className="w-full h-12 text-base bg-orange-600 hover:bg-orange-700"
            disabled={
              isLoading ||
              externalLoading ||
              searchQuery.length < 1 ||
              filteredVehicles.length === 0
            }
          >
            {isLoading || externalLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Recherche...
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Accéder au véhicule
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
