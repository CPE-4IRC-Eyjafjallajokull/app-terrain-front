"use client";

import { useEffect, useState, useCallback } from "react";
import type { InterestPoint } from "@/lib/interest-points/types";
import { fetchFireStations } from "@/lib/interest-points/service";

type UseFireStationsResult = {
  fireStations: InterestPoint[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useFireStations(): UseFireStationsResult {
  const [fireStations, setFireStations] = useState<InterestPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFireStations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const stations = await fetchFireStations();
      setFireStations(stations);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch fire stations",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFireStations();
  }, [loadFireStations]);

  return {
    fireStations,
    isLoading,
    error,
    refetch: loadFireStations,
  };
}
