"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import type {
  Vehicle,
  VehicleType,
  VehicleStatus,
  VehicleFilters,
} from "@/lib/vehicles/types";
import type { InterestPoint } from "@/lib/interest-points/types";
import {
  fetchVehicles,
  fetchVehicleTypes,
  fetchVehicleStatuses,
  fetchFireStationsForFilter,
} from "@/lib/vehicles/service";

type UseVehiclesResult = {
  // Data
  vehicles: Vehicle[];
  filteredVehicles: Vehicle[];
  vehicleTypes: VehicleType[];
  vehicleStatuses: VehicleStatus[];
  stations: InterestPoint[];

  // State
  isLoading: boolean;
  error: string | null;
  filters: VehicleFilters;
  selectedVehicle: Vehicle | null;

  // Actions
  setFilters: (filters: Partial<VehicleFilters>) => void;
  resetFilters: () => void;
  selectVehicle: (vehicle: Vehicle | null) => void;
  refetch: () => Promise<void>;
};

const initialFilters: VehicleFilters = {
  search: "",
  stationId: "",
  statusId: "",
  typeId: "",
};

export function useVehicles(): UseVehiclesResult {
  // Data state
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [vehicleStatuses, setVehicleStatuses] = useState<VehicleStatus[]>([]);
  const [stations, setStations] = useState<InterestPoint[]>([]);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<VehicleFilters>(initialFilters);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Fetch all data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [vehiclesData, typesData, statusesData, stationsData] =
        await Promise.all([
          fetchVehicles(),
          fetchVehicleTypes(),
          fetchVehicleStatuses(),
          fetchFireStationsForFilter(),
        ]);

      setVehicles(vehiclesData);
      setVehicleTypes(typesData);
      setVehicleStatuses(statusesData);
      setStations(stationsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch vehicles");
      console.error("❌ Erreur lors du chargement des données:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update selected vehicle when vehicles data changes
  useEffect(() => {
    if (selectedVehicle) {
      const updatedVehicle = vehicles.find(
        (v) => v.vehicle_id === selectedVehicle.vehicle_id
      );
      if (updatedVehicle) {
        setSelectedVehicle(updatedVehicle);
      }
    }
  }, [vehicles, selectedVehicle]);

  // Filter vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      // Search filter (immatriculation)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!vehicle.immatriculation.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Station filter
      if (filters.stationId) {
        if (
          vehicle.base_interest_point?.interest_point_id !== filters.stationId
        ) {
          return false;
        }
      }

      // Status filter
      if (filters.statusId) {
        if (vehicle.status?.vehicle_status_id !== filters.statusId) {
          return false;
        }
      }

      // Type filter
      if (filters.typeId) {
        if (vehicle.vehicle_type.vehicle_type_id !== filters.typeId) {
          return false;
        }
      }

      return true;
    });
  }, [vehicles, filters]);

  // Actions
  const setFilters = useCallback((newFilters: Partial<VehicleFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(initialFilters);
  }, []);

  const selectVehicle = useCallback((vehicle: Vehicle | null) => {
    setSelectedVehicle(vehicle);
  }, []);

  return {
    vehicles,
    filteredVehicles,
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
    refetch: fetchData,
  };
}
