"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Truck,
  AlertTriangle,
  Navigation,
  CheckCircle,
  Flame,
  RefreshCw,
  LogOut,
} from "lucide-react";
import type { Vehicle, VehicleStatus } from "@/lib/vehicles/types";
import type {
  Incident,
  IncidentEngagements,
  IncidentCasualties,
  VehicleType,
} from "@/lib/incidents/types";
import { VehicleStatusQuick } from "./vehicle-status-quick";
import { IncidentPanel } from "./incident-panel";
import { TerrainMap } from "./terrain-map";
import { toast } from "sonner";
import { signOut } from "next-auth/react";
import { useSSE } from "@/hooks/useSSE";

type TerrainDashboardProps = {
  vehicle: Vehicle;
  onBack: () => void;
};

export function TerrainDashboard({ vehicle, onBack }: TerrainDashboardProps) {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [engagements, setEngagements] = useState<IncidentEngagements | null>(
    null,
  );
  const [casualties, setCasualties] = useState<IncidentCasualties | null>(null);
  const [vehicleStatuses, setVehicleStatuses] = useState<VehicleStatus[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle>(vehicle);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch incident data linked to the vehicle's active assignment
  const fetchIncidentData = useCallback(async () => {
    if (
      !vehicle.active_assignment?.incident_id &&
      !vehicle.active_assignment?.incident_phase_id
    ) {
      setIsLoading(false);
      return;
    }

    try {
      // Get incident ID from assignment
      let incidentId = vehicle.active_assignment.incident_id;

      // If we only have phase_id, we need to get the incident from the phase
      if (!incidentId && vehicle.active_assignment.incident_phase_id) {
        // Try to fetch the incident through engagements or another API
        // For now, we'll need to fetch all incidents and find the one with this phase
        const incidentsRes = await fetch("/api/incidents");
        if (incidentsRes.ok) {
          const incidents = await incidentsRes.json();
          const matchingIncident = incidents.find((inc: Incident) =>
            inc.phases?.some(
              (p) =>
                p.incident_phase_id ===
                vehicle.active_assignment?.incident_phase_id,
            ),
          );
          if (matchingIncident) {
            incidentId = matchingIncident.incident_id;
          }
        }
      }

      if (!incidentId) {
        setIsLoading(false);
        return;
      }

      // Fetch incident details, engagements, and casualties in parallel
      const [
        incidentRes,
        engagementsRes,
        casualtiesRes,
        statusesRes,
        typesRes,
      ] = await Promise.all([
        fetch(`/api/incidents/${incidentId}`),
        fetch(`/api/incidents/${incidentId}/engagements`),
        fetch(`/api/incidents/${incidentId}/casualties`),
        fetch("/api/vehicles/statuses"),
        fetch("/api/vehicles/types"),
      ]);

      if (incidentRes.ok) {
        const incidentData = await incidentRes.json();
        setIncident(incidentData);
      }

      if (engagementsRes.ok) {
        const engagementsData = await engagementsRes.json();
        setEngagements(engagementsData);
      }

      if (casualtiesRes.ok) {
        const casualtiesData = await casualtiesRes.json();
        setCasualties(casualtiesData);
      }

      if (statusesRes.ok) {
        const statusesData = await statusesRes.json();
        setVehicleStatuses(statusesData);
      }

      if (typesRes.ok) {
        const typesData = await typesRes.json();
        setVehicleTypes(typesData);
      }
    } catch (err) {
      console.error("Error fetching incident data:", err);
      setError("Erreur lors du chargement des données");
    } finally {
      setIsLoading(false);
    }
  }, [vehicle]);

  useEffect(() => {
    fetchIncidentData();
  }, [fetchIncidentData]);

  // SSE for live vehicle updates
  const { data: sseData, isConnected: sseConnected } = useSSE("/api/events");

  // Handle SSE events for vehicle position and status updates
  useEffect(() => {
    if (!sseData) return;

    const event = sseData.event;
    const eventData = sseData.data as
      | {
          vehicle_id?: string;
          vehicle_immatriculation?: string;
          latitude?: number;
          longitude?: number;
          status_label?: string;
          timestamp?: string;
        }
      | undefined;

    if (!eventData?.vehicle_id) return;

    // Only process events for the current vehicle
    if (eventData.vehicle_id !== currentVehicle.vehicle_id) return;

    if (event === "vehicle_position_update") {
      // Update vehicle position in real-time
      setCurrentVehicle((prev) => ({
        ...prev,
        current_position: {
          latitude: eventData.latitude ?? prev.current_position?.latitude ?? 0,
          longitude:
            eventData.longitude ?? prev.current_position?.longitude ?? 0,
          timestamp: eventData.timestamp ?? new Date().toISOString(),
        },
      }));
    } else if (event === "vehicle_status_update") {
      // Update vehicle status in real-time by matching label
      if (eventData.status_label) {
        const newStatus = vehicleStatuses.find(
          (s) =>
            s.label.toLowerCase() === eventData.status_label?.toLowerCase(),
        );
        if (newStatus) {
          setCurrentVehicle((prev) => ({
            ...prev,
            status: newStatus,
          }));
          toast.info(`Statut mis à jour: ${newStatus.label}`);
        } else {
          // If no matching status found, create a temporary one with the label
          setCurrentVehicle((prev) => ({
            ...prev,
            status: {
              vehicle_status_id: "unknown",
              label: eventData.status_label || "Inconnu",
            },
          }));
          toast.info(`Statut mis à jour: ${eventData.status_label}`);
        }
      }
    }
  }, [sseData, currentVehicle.vehicle_id, vehicleStatuses]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Refresh vehicle data
      const vehicleRes = await fetch(`/api/vehicles/${vehicle.vehicle_id}`);
      if (vehicleRes.ok) {
        const vehicleData = await vehicleRes.json();
        setCurrentVehicle(vehicleData);
      }
      await fetchIncidentData();
      toast.success("Données actualisées");
    } catch {
      toast.error("Erreur lors de l'actualisation");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleStatusChange = async (newStatusId: string) => {
    try {
      const response = await fetch(
        `/api/vehicles/${currentVehicle.vehicle_id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status_id: newStatusId }),
        },
      );

      if (!response.ok)
        throw new Error("Erreur lors de la mise à jour du statut");

      const updatedVehicle = await response.json();
      setCurrentVehicle(updatedVehicle);
      toast.success("Statut mis à jour");
    } catch {
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const handleCasualtyUpdate = async () => {
    if (!incident) return;
    try {
      const res = await fetch(
        `/api/incidents/${incident.incident_id}/casualties`,
      );
      if (res.ok) {
        const data = await res.json();
        setCasualties(data);
      }
    } catch (err) {
      console.error("Error refreshing casualties:", err);
    }
  };

  const getStatusBadge = (status: VehicleStatus | null) => {
    const label = status?.label?.toLowerCase() || "";

    if (label.includes("disponible") && !label.includes("indisponible")) {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200">
          <CheckCircle className="w-4 h-4 mr-1" />
          Disponible
        </Badge>
      );
    }
    if (
      label.includes("engagé") ||
      label.includes("intervention") ||
      label.includes("sur place")
    ) {
      return (
        <Badge className="bg-orange-100 text-orange-700 border-orange-200">
          <AlertTriangle className="w-4 h-4 mr-1" />
          {status?.label || "En intervention"}
        </Badge>
      );
    }
    if (label.includes("en route")) {
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
          <Navigation className="w-4 h-4 mr-1" />
          En route
        </Badge>
      );
    }
    if (label.includes("hors service") || label.includes("indisponible")) {
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200">
          <AlertTriangle className="w-4 h-4 mr-1" />
          Indisponible
        </Badge>
      );
    }
    return <Badge variant="secondary">{status?.label || "Inconnu"}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate vehicle and incident positions for map
  const vehiclePosition = currentVehicle.current_position
    ? {
        lat: currentVehicle.current_position.latitude || 0,
        lng: currentVehicle.current_position.longitude || 0,
      }
    : null;

  const incidentPosition = incident
    ? {
        lat: incident.latitude || 0,
        lng: incident.longitude || 0,
      }
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-orange-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-orange-200 bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Truck className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h1 className="font-mono font-bold text-lg">
                  {currentVehicle.immatriculation}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {currentVehicle.vehicle_type?.label}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* SSE Connection indicator */}
            <div
              className={`w-2 h-2 rounded-full ${sseConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
              title={
                sseConnected
                  ? "Connecté au serveur temps réel"
                  : "Déconnecté du serveur temps réel"
              }
            />
            {getStatusBadge(currentVehicle.status)}
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-muted-foreground hover:text-destructive hover:border-destructive"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <Card className="border-destructive/50 bg-destructive/10 mb-6">
            <CardContent className="py-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-[400px] rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-48 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Map Section */}
            <div className="space-y-4">
              <TerrainMap
                vehiclePosition={vehiclePosition}
                incidentPosition={incidentPosition}
                vehicleLabel={currentVehicle.immatriculation}
                incidentAddress={incident?.address}
              />

              {/* Quick Actions - Status Change */}
              <VehicleStatusQuick
                currentStatus={currentVehicle.status}
                statuses={vehicleStatuses}
                onStatusChange={handleStatusChange}
                isDisabled={isRefreshing}
              />
            </div>

            {/* Info Panel */}
            <div className="space-y-4">
              {/* Vehicle Info Card */}
              <Card className="border-orange-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-orange-600" />
                    <CardTitle className="text-lg">
                      Informations véhicule
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-medium">
                        {currentVehicle.vehicle_type?.label || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Énergie</p>
                      <p className="font-medium">
                        {currentVehicle.energy?.label || "—"}
                        {currentVehicle.energy_level != null &&
                          ` (${Math.round(currentVehicle.energy_level * 100)}%)`}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Caserne</p>
                      <p className="font-medium">
                        {currentVehicle.base_interest_point?.name || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">
                        Position mise à jour
                      </p>
                      <p className="font-medium">
                        {currentVehicle.current_position?.timestamp
                          ? formatDate(
                              currentVehicle.current_position.timestamp,
                            )
                          : "—"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Incident Panel */}
              {incident ? (
                <IncidentPanel
                  incident={incident}
                  engagements={engagements}
                  casualties={casualties}
                  vehicleTypes={vehicleTypes}
                  onCasualtyUpdate={handleCasualtyUpdate}
                  onReinforcementSuccess={fetchIncidentData}
                />
              ) : (
                <Card className="border-dashed border-muted-foreground/30">
                  <CardContent className="py-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <Flame className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-1">
                      Aucun incident assigné
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Ce véhicule n&apos;est actuellement affecté à aucune
                      intervention
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
