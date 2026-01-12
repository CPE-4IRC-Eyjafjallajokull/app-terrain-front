"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import type {
  Incident,
  IncidentEngagements,
  IncidentFilters,
  VehicleType,
} from "@/lib/incidents/types";
import {
  fetchIncidents,
  fetchIncidentEngagements,
  fetchVehicleTypes,
} from "@/lib/incidents/service";

type UseIncidentsResult = {
  // Data
  incidents: Incident[];
  filteredIncidents: Incident[];
  vehicleTypes: VehicleType[];
  selectedIncident: Incident | null;
  engagements: IncidentEngagements | null;

  // State
  isLoading: boolean;
  isLoadingEngagements: boolean;
  error: string | null;
  filters: IncidentFilters;

  // Actions
  setFilters: (filters: Partial<IncidentFilters>) => void;
  resetFilters: () => void;
  selectIncident: (incident: Incident | null) => void;
  refetch: () => Promise<void>;
  refetchEngagements: () => Promise<void>;
};

const initialFilters: IncidentFilters = {
  search: "",
  showEnded: false,
};

export function useIncidents(): UseIncidentsResult {
  // Data state
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [engagements, setEngagements] = useState<IncidentEngagements | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEngagements, setIsLoadingEngagements] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<IncidentFilters>(initialFilters);

  // Fetch all incidents and vehicle types
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [incidentsData, typesData] = await Promise.all([
        fetchIncidents(),
        fetchVehicleTypes(),
      ]);

      setIncidents(incidentsData);
      setVehicleTypes(typesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch incidents");
      console.error("❌ Erreur lors du chargement des incidents:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch engagements for selected incident
  const fetchEngagementsForIncident = useCallback(async () => {
    if (!selectedIncident) {
      setEngagements(null);
      return;
    }

    setIsLoadingEngagements(true);

    try {
      const data = await fetchIncidentEngagements(selectedIncident.incident_id);
      setEngagements(data);
    } catch (err) {
      console.error("❌ Erreur lors du chargement des engagements:", err);
      setEngagements(null);
    } finally {
      setIsLoadingEngagements(false);
    }
  }, [selectedIncident]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchEngagementsForIncident();
  }, [fetchEngagementsForIncident]);

  // Filter incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      // Search filter (address, city, description)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          incident.address?.toLowerCase().includes(searchLower) ||
          incident.city?.toLowerCase().includes(searchLower) ||
          incident.description?.toLowerCase().includes(searchLower) ||
          incident.zipcode?.toLowerCase().includes(searchLower);
        if (!matchesSearch) {
          return false;
        }
      }

      // Hide ended incidents by default
      if (!filters.showEnded && incident.ended_at) {
        return false;
      }

      return true;
    });
  }, [incidents, filters]);

  // Set filters
  const setFilters = useCallback((newFilters: Partial<IncidentFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFiltersState(initialFilters);
  }, []);

  // Select incident
  const selectIncident = useCallback((incident: Incident | null) => {
    setSelectedIncident(incident);
  }, []);

  return {
    incidents,
    filteredIncidents,
    vehicleTypes,
    selectedIncident,
    engagements,
    isLoading,
    isLoadingEngagements,
    error,
    filters,
    setFilters,
    resetFilters,
    selectIncident,
    refetch: fetchData,
    refetchEngagements: fetchEngagementsForIncident,
  };
}
