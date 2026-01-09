"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  Fuel,
  Building2,
  Clock,
  AlertCircle,
  CheckCircle,
  Circle,
} from "lucide-react";
import type { Vehicle } from "@/lib/vehicles/types";

type VehicleCardProps = {
  vehicle: Vehicle;
  onClick: () => void;
  isSelected: boolean;
};

function getStatusColor(label: string | undefined): string {
  if (!label) return "bg-gray-100 text-gray-700";

  const labelLower = label.toLowerCase();
  // Exclure "indisponible" du statut vert disponible
  if (
    (labelLower.includes("disponible") || labelLower.includes("available")) &&
    !labelLower.includes("indisponible") &&
    !labelLower.includes("unavailable")
  ) {
    return "bg-green-100 text-green-700 border-green-200";
  }
  if (
    labelLower.includes("indisponible") ||
    labelLower.includes("unavailable")
  ) {
    return "bg-gray-100 text-gray-700 border-gray-200";
  }
  if (labelLower.includes("intervention") || labelLower.includes("busy")) {
    return "bg-red-100 text-red-700 border-red-200";
  }
  if (labelLower.includes("maintenance") || labelLower.includes("repair")) {
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  }
  if (labelLower.includes("retour") || labelLower.includes("transit")) {
    return "bg-blue-100 text-blue-700 border-blue-200";
  }
  return "bg-gray-100 text-gray-700 border-gray-200";
}

function getStatusIcon(label: string | undefined) {
  if (!label) return <Circle className="w-3 h-3" />;

  const labelLower = label.toLowerCase();
  // Exclure "indisponible" de l'icône verte
  if (
    (labelLower.includes("disponible") || labelLower.includes("available")) &&
    !labelLower.includes("indisponible") &&
    !labelLower.includes("unavailable")
  ) {
    return <CheckCircle className="w-3 h-3" />;
  }
  if (labelLower.includes("intervention") || labelLower.includes("busy")) {
    return <AlertCircle className="w-3 h-3" />;
  }
  return <Circle className="w-3 h-3" />;
}

export function VehicleCard({
  vehicle,
  onClick,
  isSelected,
}: VehicleCardProps) {
  const statusLabel = vehicle.status?.label;
  const statusColorClass = getStatusColor(statusLabel);

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected
          ? "ring-2 ring-primary border-primary bg-primary/5"
          : "border-primary/10 hover:border-primary/30"
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Main info */}
          <div className="flex-1 min-w-0">
            {/* Immatriculation + Type */}
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-lg tracking-wide">
                {vehicle.immatriculation}
              </span>
              <Badge
                variant="outline"
                className="bg-primary/5 border-primary/20 text-primary font-medium"
              >
                {vehicle.vehicle_type.code}
              </Badge>
            </div>

            {/* Type label */}
            <p className="text-sm text-muted-foreground mb-3">
              {vehicle.vehicle_type.label}
            </p>

            {/* Station */}
            {vehicle.base_interest_point?.name && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Building2 className="w-3.5 h-3.5 text-primary/60" />
                <span className="truncate">
                  {vehicle.base_interest_point.name}
                </span>
              </div>
            )}
          </div>

          {/* Right: Status + Energy */}
          <div className="flex flex-col items-end gap-2">
            {/* Status badge */}
            <Badge className={`${statusColorClass} border font-medium`}>
              <span className="flex items-center gap-1">
                {getStatusIcon(statusLabel)}
                {statusLabel || "Inconnu"}
              </span>
            </Badge>

            {/* Energy level */}
            {vehicle.energy && vehicle.energy_level !== null && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Fuel className="w-3.5 h-3.5" />
                <span>{Math.round(vehicle.energy_level * 100)}%</span>
              </div>
            )}

            {/* Position timestamp */}
            {vehicle.current_position && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <Clock className="w-3 h-3" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
