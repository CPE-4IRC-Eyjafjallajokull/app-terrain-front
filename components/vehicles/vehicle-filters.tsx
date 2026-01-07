"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, Filter } from "lucide-react";
import type { VehicleFilters } from "@/lib/vehicles/types";
import type { VehicleType, VehicleStatus } from "@/lib/vehicles/types";
import type { InterestPoint } from "@/lib/interest-points/types";

type VehicleFiltersProps = {
  filters: VehicleFilters;
  onFiltersChange: (filters: Partial<VehicleFilters>) => void;
  onReset: () => void;
  vehicleTypes: VehicleType[];
  vehicleStatuses: VehicleStatus[];
  stations: InterestPoint[];
  totalCount: number;
  filteredCount: number;
};

export function VehicleFiltersBar({
  filters,
  onFiltersChange,
  onReset,
  vehicleTypes,
  vehicleStatuses,
  stations,
  totalCount,
  filteredCount,
}: VehicleFiltersProps) {
  const hasActiveFilters =
    filters.search ||
    filters.stationId ||
    filters.statusId ||
    filters.typeId;

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par immatriculation..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ search: e.target.value })}
          className="pl-10 bg-background border-primary/20 focus-visible:ring-primary/30"
        />
        {filters.search && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => onFiltersChange({ search: "" })}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Filter dropdowns */}
      <div className="flex flex-wrap gap-3">
        {/* Station filter */}
        <select
          value={filters.stationId}
          onChange={(e) => onFiltersChange({ stationId: e.target.value })}
          className="h-9 px-3 rounded-md border border-primary/20 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Toutes les casernes</option>
          {stations.map((station) => (
            <option
              key={station.interest_point_id}
              value={station.interest_point_id}
            >
              {station.name}
            </option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={filters.statusId}
          onChange={(e) => onFiltersChange({ statusId: e.target.value })}
          className="h-9 px-3 rounded-md border border-primary/20 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Tous les statuts</option>
          {vehicleStatuses.map((status) => (
            <option
              key={status.vehicle_status_id}
              value={status.vehicle_status_id}
            >
              {status.label}
            </option>
          ))}
        </select>

        {/* Type filter */}
        <select
          value={filters.typeId}
          onChange={(e) => onFiltersChange({ typeId: e.target.value })}
          className="h-9 px-3 rounded-md border border-primary/20 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Tous les types</option>
          {vehicleTypes.map((type) => (
            <option key={type.vehicle_type_id} value={type.vehicle_type_id}>
              {type.label} ({type.code})
            </option>
          ))}
        </select>

        {/* Reset button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="h-9 border-primary/20 hover:bg-primary/5"
          >
            <X className="w-4 h-4 mr-1" />
            Réinitialiser
          </Button>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="w-4 h-4" />
        <span>
          {filteredCount === totalCount ? (
            <>{totalCount} véhicule(s)</>
          ) : (
            <>
              {filteredCount} sur {totalCount} véhicule(s)
            </>
          )}
        </span>
        {hasActiveFilters && (
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary text-xs"
          >
            Filtres actifs
          </Badge>
        )}
      </div>
    </div>
  );
}
