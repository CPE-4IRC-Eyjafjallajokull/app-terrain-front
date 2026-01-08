"use client";

import { useEffect, useState, useCallback } from "react";
import type {
  IncidentSituation,
  IncidentEngagements,
  IncidentCasualties,
  CasualtyType,
  CasualtyStatus,
  CasualtyCreate,
  CasualtyUpdate,
  CasualtyDetail,
} from "@/lib/incidents/types";
import {
  fetchIncidentSituation,
  fetchIncidentEngagements,
  fetchIncidentCasualties,
  fetchCasualtyTypes,
  fetchCasualtyStatuses,
  createCasualty,
  updateCasualty,
  deleteCasualty,
} from "@/lib/incidents/service";

type UseIncidentDetailResult = {
  // Data
  situation: IncidentSituation | null;
  engagements: IncidentEngagements | null;
  casualties: IncidentCasualties | null;
  casualtyTypes: CasualtyType[];
  casualtyStatuses: CasualtyStatus[];

  // State
  isLoading: boolean;
  error: string | null;
  isSubmitting: boolean;

  // Actions
  refetch: () => Promise<void>;
  addCasualty: (data: CasualtyCreate) => Promise<void>;
  editCasualty: (casualtyId: string, data: CasualtyUpdate) => Promise<void>;
  removeCasualty: (casualtyId: string) => Promise<void>;
};

export function useIncidentDetail(incidentId: string): UseIncidentDetailResult {
  // Data state
  const [situation, setSituation] = useState<IncidentSituation | null>(null);
  const [engagements, setEngagements] = useState<IncidentEngagements | null>(
    null,
  );
  const [casualties, setCasualties] = useState<IncidentCasualties | null>(null);
  const [casualtyTypes, setCasualtyTypes] = useState<CasualtyType[]>([]);
  const [casualtyStatuses, setCasualtyStatuses] = useState<CasualtyStatus[]>(
    [],
  );

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!incidentId) return;

    setIsLoading(true);
    setError(null);

    try {
      const [
        situationData,
        engagementsData,
        casualtiesData,
        typesData,
        statusesData,
      ] = await Promise.all([
        fetchIncidentSituation(incidentId),
        fetchIncidentEngagements(incidentId),
        fetchIncidentCasualties(incidentId),
        fetchCasualtyTypes(),
        fetchCasualtyStatuses(),
      ]);

      setSituation(situationData);
      setEngagements(engagementsData);
      setCasualties(casualtiesData);
      setCasualtyTypes(typesData);
      setCasualtyStatuses(statusesData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch incident details",
      );
      console.error("❌ Erreur lors du chargement de l'incident:", err);
    } finally {
      setIsLoading(false);
    }
  }, [incidentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Add a new casualty
  const addCasualty = useCallback(
    async (data: CasualtyCreate) => {
      setIsSubmitting(true);
      try {
        await createCasualty(data);
        // Refresh casualties after creation
        const casualtiesData = await fetchIncidentCasualties(incidentId);
        setCasualties(casualtiesData);
      } catch (err) {
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [incidentId],
  );

  // Edit an existing casualty
  const editCasualty = useCallback(
    async (casualtyId: string, data: CasualtyUpdate) => {
      setIsSubmitting(true);
      try {
        await updateCasualty(casualtyId, data);
        // Refresh casualties after update
        const casualtiesData = await fetchIncidentCasualties(incidentId);
        setCasualties(casualtiesData);
      } catch (err) {
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [incidentId],
  );

  // Remove a casualty
  const removeCasualty = useCallback(
    async (casualtyId: string) => {
      setIsSubmitting(true);
      try {
        await deleteCasualty(casualtyId);
        // Refresh casualties after deletion
        const casualtiesData = await fetchIncidentCasualties(incidentId);
        setCasualties(casualtiesData);
      } catch (err) {
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [incidentId],
  );

  return {
    situation,
    engagements,
    casualties,
    casualtyTypes,
    casualtyStatuses,
    isLoading,
    error,
    isSubmitting,
    refetch: fetchData,
    addCasualty,
    editCasualty,
    removeCasualty,
  };
}
