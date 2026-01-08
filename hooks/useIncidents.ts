"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import type { IncidentRead, IncidentFilters } from "@/lib/incidents/types";
import { fetchIncidents } from "@/lib/incidents/service";

type UseIncidentsResult = {
  // Data
  incidents: IncidentRead[];
  filteredIncidents: IncidentRead[];

  // State
  isLoading: boolean;
  error: string | null;
  filters: IncidentFilters;

  // Actions
  setFilters: (filters: Partial<IncidentFilters>) => void;
  resetFilters: () => void;
  refetch: () => Promise<void>;
};

const initialFilters: IncidentFilters = {
  search: "",
  showEnded: false,
};

export function useIncidents(): UseIncidentsResult {
  // Data state
  const [incidents, setIncidents] = useState<IncidentRead[]>([]);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<IncidentFilters>(initialFilters);

  // Fetch all data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const incidentsData = await fetchIncidents();
      setIncidents(incidentsData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch incidents",
      );
      console.error("❌ Erreur lors du chargement des incidents:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      // Search filter (address, city, description)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesAddress = incident.address
          ?.toLowerCase()
          .includes(searchLower);
        const matchesCity = incident.city?.toLowerCase().includes(searchLower);
        const matchesDescription = incident.description
          ?.toLowerCase()
          .includes(searchLower);

        if (!matchesAddress && !matchesCity && !matchesDescription) {
          return false;
        }
      }

      // Show ended filter
      if (!filters.showEnded && incident.ended_at) {
        return false;
      }

      return true;
    });
  }, [incidents, filters]);

  // Actions
  const setFilters = useCallback((newFilters: Partial<IncidentFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(initialFilters);
  }, []);

  return {
    incidents,
    filteredIncidents,
    isLoading,
    error,
    filters,
    setFilters,
    resetFilters,
    refetch: fetchData,
  };
}
