"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  X,
  MapPin,
  Fuel,
  Building2,
  Clock,
  Package,
  AlertTriangle,
  CheckCircle,
  Navigation,
  Loader2,
  Pencil,
  Save,
  XCircle,
  Circle,
} from "lucide-react";
import type { Vehicle, VehicleStatus } from "@/lib/vehicles/types";
import {
  reverseGeocode,
  type ReverseGeocodeResult,
} from "@/lib/geocoding/service";
import { updateVehicleStatus } from "@/lib/vehicles/service";
import { toast } from "sonner";

type VehicleDetailProps = {
  vehicle: Vehicle;
  onClose: () => void;
  vehicleStatuses: VehicleStatus[];
  onVehicleUpdate?: () => void;
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusBadge(label: string | undefined) {
  if (!label) {
    return (
      <Badge variant="secondary" className="text-sm">
        Statut inconnu
      </Badge>
    );
  }

  const labelLower = label.toLowerCase();

  // Hors service -> Rouge
  if (
    labelLower.includes("hors service") ||
    labelLower.includes("out of service")
  ) {
    return (
      <Badge className="bg-red-100 text-red-700 border border-red-200 text-sm">
        <AlertTriangle className="w-4 h-4 mr-1" />
        {label}
      </Badge>
    );
  }
  // Engagé -> Bleu
  if (labelLower.includes("engagé") || labelLower.includes("engaged")) {
    return (
      <Badge className="bg-blue-100 text-blue-700 border border-blue-200 text-sm">
        <CheckCircle className="w-4 h-4 mr-1" />
        {label}
      </Badge>
    );
  }
  // Disponible -> Vert (exclure indisponible)
  if (
    (labelLower.includes("disponible") || labelLower.includes("available")) &&
    !labelLower.includes("indisponible") &&
    !labelLower.includes("unavailable")
  ) {
    return (
      <Badge className="bg-green-100 text-green-700 border border-green-200 text-sm">
        <CheckCircle className="w-4 h-4 mr-1" />
        {label}
      </Badge>
    );
  }
  // Sur intervention -> Orange
  if (labelLower.includes("intervention")) {
    return (
      <Badge className="bg-orange-100 text-orange-700 border border-orange-200 text-sm">
        <AlertTriangle className="w-4 h-4 mr-1" />
        {label}
      </Badge>
    );
  }
  // Retour -> Violet
  if (labelLower.includes("retour") || labelLower.includes("returning")) {
    return (
      <Badge className="bg-violet-100 text-violet-700 border border-violet-200 text-sm">
        <CheckCircle className="w-4 h-4 mr-1" />
        {label}
      </Badge>
    );
  }
  // Transport -> Bleu ciel
  if (labelLower.includes("transport")) {
    return (
      <Badge className="bg-sky-100 text-sky-700 border border-sky-200 text-sm">
        <CheckCircle className="w-4 h-4 mr-1" />
        {label}
      </Badge>
    );
  }
  // Indisponible -> Gris
  if (
    labelLower.includes("indisponible") ||
    labelLower.includes("unavailable")
  ) {
    return (
      <Badge className="bg-gray-100 text-gray-700 border border-gray-200 text-sm">
        <Circle className="w-4 h-4 mr-1" />
        {label}
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="text-sm">
      {label}
    </Badge>
  );
}

export function VehicleDetail({
  vehicle,
  onClose,
  vehicleStatuses,
  onVehicleUpdate,
}: VehicleDetailProps) {
  const [positionAddress, setPositionAddress] =
    useState<ReverseGeocodeResult | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [selectedStatusId, setSelectedStatusId] = useState(
    vehicle.status?.vehicle_status_id || "",
  );
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Fetch address when position changes
  useEffect(() => {
    const fetchAddress = async () => {
      if (
        vehicle.current_position?.latitude &&
        vehicle.current_position?.longitude
      ) {
        setIsLoadingAddress(true);
        try {
          const result = await reverseGeocode({
            latitude: vehicle.current_position.latitude,
            longitude: vehicle.current_position.longitude,
          });
          setPositionAddress(result);
        } catch (error) {
          console.error("Failed to fetch address:", error);
          setPositionAddress(null);
        } finally {
          setIsLoadingAddress(false);
        }
      } else {
        setPositionAddress(null);
      }
    };

    fetchAddress();
  }, [vehicle.current_position?.latitude, vehicle.current_position?.longitude]);

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader className="border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-3">
              {vehicle.immatriculation}
              {vehicle.vehicle_type?.code && (
                <Badge
                  variant="outline"
                  className="bg-primary/10 border-primary/30 text-primary"
                >
                  {vehicle.vehicle_type.code}
                </Badge>
              )}
            </CardTitle>
            <p className="text-muted-foreground mt-1">
              {vehicle.vehicle_type?.label || "Type inconnu"}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Statut actuel
            </span>
            {!isEditingStatus ? (
              <div className="flex items-center gap-2">
                {getStatusBadge(vehicle.status?.label)}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setIsEditingStatus(true);
                    setSelectedStatusId(
                      vehicle.status?.vehicle_status_id || "",
                    );
                  }}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <select
                  value={selectedStatusId}
                  onChange={(e) => setSelectedStatusId(e.target.value)}
                  className="h-9 px-3 rounded-md border border-primary/20 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  disabled={isUpdatingStatus}
                >
                  <option value="">Sélectionner un statut</option>
                  {vehicleStatuses.map((status) => (
                    <option
                      key={status.vehicle_status_id}
                      value={status.vehicle_status_id}
                    >
                      {status.label}
                    </option>
                  ))}
                </select>
                <Button
                  variant="default"
                  size="icon"
                  className="h-8 w-8"
                  onClick={async () => {
                    if (!selectedStatusId) {
                      toast.error("Veuillez sélectionner un statut");
                      return;
                    }
                    setIsUpdatingStatus(true);
                    try {
                      await updateVehicleStatus(
                        vehicle.vehicle_id,
                        selectedStatusId,
                      );
                      toast.success("Statut mis à jour avec succès");
                      setIsEditingStatus(false);

                      // Ne pas utiliser le véhicule retourné car il peut être incomplet
                      // Trigger un refetch pour obtenir les données complètes
                      if (onVehicleUpdate) {
                        onVehicleUpdate();
                      }
                    } catch (error) {
                      toast.error(
                        error instanceof Error
                          ? error.message
                          : "Erreur lors de la mise à jour du statut",
                      );
                    } finally {
                      setIsUpdatingStatus(false);
                    }
                  }}
                  disabled={isUpdatingStatus}
                >
                  {isUpdatingStatus ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setIsEditingStatus(false);
                    setSelectedStatusId(
                      vehicle.status?.vehicle_status_id || "",
                    );
                  }}
                  disabled={isUpdatingStatus}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Active assignment alert */}
        {vehicle.active_assignment &&
          (vehicle.active_assignment.incident_id ? (
            <Link
              href={`/incidents/${vehicle.active_assignment.incident_id}`}
              className="block"
            >
              <div className="p-4 rounded-lg bg-orange-50 border border-orange-200 hover:bg-orange-100 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 text-orange-700 font-medium">
                  <AlertTriangle className="w-5 h-5" />
                  En intervention
                </div>
                <p className="text-sm text-orange-600 mt-1">
                  Affecté depuis le{" "}
                  {formatDate(vehicle.active_assignment.assigned_at)}
                </p>
                <p className="text-xs text-orange-600 mt-1 font-medium">
                  → Cliquez pour voir l&apos;incident
                </p>
              </div>
            </Link>
          ) : (
            <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
              <div className="flex items-center gap-2 text-orange-700 font-medium">
                <AlertTriangle className="w-5 h-5" />
                En intervention
              </div>
              <p className="text-sm text-orange-600 mt-1">
                Affecté depuis le{" "}
                {formatDate(vehicle.active_assignment.assigned_at)}
              </p>
            </div>
          ))}

        {/* Base station */}
        {vehicle.base_interest_point && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Building2 className="w-4 h-4" />
              Caserne de rattachement
            </div>
            <div className="pl-6">
              <p className="font-medium">{vehicle.base_interest_point.name}</p>
              {vehicle.base_interest_point.address && (
                <p className="text-sm text-muted-foreground">
                  {vehicle.base_interest_point.address}
                </p>
              )}
              {vehicle.base_interest_point.city && (
                <p className="text-sm text-muted-foreground">
                  {vehicle.base_interest_point.zipcode}{" "}
                  {vehicle.base_interest_point.city}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Current position - only show if not "Disponible" (available vehicles are at the station) */}
        {vehicle.current_position &&
          (vehicle.current_position.latitude ||
            vehicle.current_position.longitude) &&
          !vehicle.status?.label?.toLowerCase().includes("disponible") && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Navigation className="w-4 h-4" />
                Position actuelle
              </div>
              <div className="pl-6 p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-mono text-sm">
                    {vehicle.current_position.latitude?.toFixed(6)},{" "}
                    {vehicle.current_position.longitude?.toFixed(6)}
                  </span>
                </div>

                {/* Reverse geocoded address */}
                <div className="mt-2 pl-6">
                  {isLoadingAddress ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Chargement de l&apos;adresse...
                    </div>
                  ) : positionAddress ? (
                    <div className="text-sm">
                      {positionAddress.display_name ? (
                        <p className="text-foreground">
                          {positionAddress.display_name}
                        </p>
                      ) : positionAddress.address ? (
                        <>
                          {(positionAddress.address.house_number ||
                            positionAddress.address.road) && (
                            <p className="text-foreground">
                              {positionAddress.address.house_number}{" "}
                              {positionAddress.address.road}
                            </p>
                          )}
                          {(positionAddress.address.postcode ||
                            positionAddress.address.city ||
                            positionAddress.address.town ||
                            positionAddress.address.village) && (
                            <p className="text-muted-foreground">
                              {positionAddress.address.postcode}{" "}
                              {positionAddress.address.city ||
                                positionAddress.address.town ||
                                positionAddress.address.village}
                            </p>
                          )}
                        </>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      Adresse non disponible
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  Dernière mise à jour :{" "}
                  {formatDate(vehicle.current_position.timestamp)}
                </div>
              </div>
            </div>
          )}

        {/* Energy */}
        {vehicle.energy && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Fuel className="w-4 h-4" />
              Énergie
            </div>
            <div className="pl-6">
              <div className="flex items-center gap-3">
                <span className="text-sm">{vehicle.energy.label}</span>
                {vehicle.energy_level !== null && (
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          vehicle.energy_level * 100 > 50
                            ? "bg-green-500"
                            : vehicle.energy_level * 100 > 20
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${vehicle.energy_level * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {Math.round(vehicle.energy_level * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Consumables */}
        {vehicle.consumable_stocks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Package className="w-4 h-4" />
              Ressources
            </div>
            <div className="pl-6 grid grid-cols-2 gap-2">
              {vehicle.consumable_stocks.map((stock) => (
                <div
                  key={stock.consumable_type.vehicle_consumable_type_id}
                  className="p-2 rounded-lg bg-muted/50 text-sm"
                >
                  <span className="font-medium">
                    {stock.consumable_type.label}
                  </span>
                  <div className="text-muted-foreground">
                    {stock.current_quantity || "N/A"}{" "}
                    {stock.consumable_type.unit || ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
